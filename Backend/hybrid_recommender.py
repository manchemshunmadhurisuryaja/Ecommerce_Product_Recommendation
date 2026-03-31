import joblib
import pandas as pd
import numpy as np
from implicit.bpr import BayesianPersonalizedRanking
from scipy.sparse import csr_matrix


#Load the models
tfidf_vectorizer = joblib.load("models/tfidf_vectorizer.pkl")
cosine_sim_tfidf = joblib.load("models/cosine_sim.pkl")
reorder_popularity = joblib.load("models/reorder_popularity.pkl")

product_indices = joblib.load("models/product_indices.pkl")

user_map = joblib.load("models/user_map.pkl")
item_map = joblib.load("models/item_map.pkl")

hybrid_config = joblib.load("models/hybrid_config.pkl")

# Reverse mapper for BPR
reverse_item_mapper = {v: k for k, v in item_map.items()}

# Load BPR model
bpr_model = BayesianPersonalizedRanking().load("models/bpr_model.npz")

# -------- Load dataset --------
df1 = pd.read_csv("Supermarket dataset for predictive marketing 2023.csv")

# Create user-item interaction matrix for BPR
def create_interaction_matrix():
    interactions = df1[['user_id', 'product_id']].copy()
    interactions['value'] = 1  # Binary interaction (purchased or not)
    
    # Map to internal indices
    interactions['user_idx'] = interactions['user_id'].map(user_map)
    interactions['item_idx'] = interactions['product_id'].map(item_map)
    
    # Remove unmapped entries
    interactions = interactions.dropna()
    
    # Create sparse matrix
    train_matrix = csr_matrix(
        (interactions['value'], 
         (interactions['user_idx'].astype(int), interactions['item_idx'].astype(int))),
        shape=(len(user_map), len(item_map))
    )
    
    return train_matrix

train_matrix = create_interaction_matrix()


product_df = df1[['product_id','product_name','department']] \
    .drop_duplicates(subset='product_id') \
    .reset_index(drop=True)

product_indices = pd.Series(product_df.index, index=product_df['product_id'])


# -------- Recommendation function --------
def recommend_two_stage_single(user_id, top_k=20):

    # -------- Check if user exists --------
    if user_id not in df1['user_id'].unique():
        return {
            "status": "error",
            "message": "User ID not found. Please register as a new user."
        }

    def get_product_details(pid):

        row = product_df[product_df['product_id'] == pid]

        if not row.empty:
            return {
                "id": int(pid),
                "name": row.iloc[0]['product_name'],
                "category": row.iloc[0]['department']
            }

        return None


    # -------- User purchase history --------
    user_history = df1[df1['user_id'] == user_id]['product_id'].unique()


    # -------- Cold vs Active User --------
    if user_id not in user_map or len(user_history) < 5:
        candidate_size = 30
        w_tfidf, w_collab, w_pop = 0.5, 0.0, 0.5
    else:
        candidate_size = 100
        w_tfidf, w_collab, w_pop = 0.4, 0.4, 0.2


    # -------- Candidate products --------
    candidates = reorder_popularity.head(candidate_size).index.tolist()

    final_scores = {}
    explanations = {}

    for pid in candidates:
        explanations[pid] = {
            "content_score": 0,
            "collaborative_score": 0,
            "popularity_score": 0
        }


    # -------- Content Based (Normalized) --------
    for hist_pid in user_history:

        if hist_pid in product_indices:

            sims = cosine_sim_tfidf[product_indices[hist_pid]]

            for idx, score in enumerate(sims):

                prod_id = product_df.iloc[idx]['product_id']

                if prod_id in candidates:

                    contrib = w_tfidf * score / len(user_history)

                    final_scores[prod_id] = final_scores.get(prod_id,0) + contrib
                    explanations[prod_id]["content_score"] += contrib


    # -------- Collaborative Filtering (BPR) --------
    if user_id in user_map and w_collab > 0:

        user_idx = user_map[user_id]

        recs = bpr_model.recommend(
            user_idx,
            train_matrix[user_idx],
            N=len(candidates),
            filter_already_liked_items=False
        )

        for rec in recs:

            item_idx = int(rec[0])
            score = rec[1]

            pid = reverse_item_mapper[item_idx]

            if pid in candidates:

                contrib = w_collab * score

                final_scores[pid] = final_scores.get(pid,0) + contrib
                explanations[pid]["collaborative_score"] += contrib


    # -------- Popularity Score --------
    pop_score = reorder_popularity / reorder_popularity.max()

    for pid in candidates:

        contrib = w_pop * pop_score[pid]

        final_scores[pid] = final_scores.get(pid,0) + contrib
        explanations[pid]["popularity_score"] += contrib


    # -------- Ranking --------
    ranked = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)

    top_product_ids = [pid for pid,_ in ranked[:top_k]]

    recommended_items = []


    for pid in top_product_ids:

        details = get_product_details(pid)

        exp = explanations[pid]

        total = sum(exp.values())

        if total == 0:
            content_pct = collab_pct = pop_pct = 0
        else:
            content_pct = round(exp["content_score"]/total*100,2)
            collab_pct = round(exp["collaborative_score"]/total*100,2)
            pop_pct = round(exp["popularity_score"]/total*100,2)


        # -------- Top-2 Factor Identification --------
        scores = {
            "content": content_pct,
            "collaborative": collab_pct,
            "popularity": pop_pct
        }

        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

        top1 = sorted_scores[0][0]
        top2 = sorted_scores[1][0]


        # -------- Similar Purchased Items --------
        hist_names = []
        similar_items = []

        if pid in product_indices:

            rec_idx = product_indices[pid]

            for hist_pid in user_history:

                if hist_pid in product_indices:

                    hist_idx = product_indices[hist_pid]

                    similarity_score = cosine_sim_tfidf[rec_idx][hist_idx]

                    similar_items.append((hist_pid, similarity_score))

            similar_items = sorted(similar_items, key=lambda x: x[1], reverse=True)

            top_similar = similar_items[:2]

            for item_id,_ in top_similar:

                name = df1[df1['product_id'] == item_id]['product_name'].iloc[0]

                hist_names.append(name)


        # -------- Explanation Generation --------
        content_part = ""
        collab_part = "users with similar purchase patterns also bought this item"
        pop_part = "this item is currently popular among many customers"

        if hist_names:

            if len(hist_names) == 1:
                content_part = f"similar to your previously purchased item: {hist_names[0]}"
            else:
                content_part = f"similar to your previously purchased items: {hist_names[0]} and {hist_names[1]}"


        parts = []

        if top1 == "content" and content_part:
            parts.append(content_part)
        elif top1 == "collaborative":
            parts.append(collab_part)
        else:
            parts.append(pop_part)


        if top2 == "content" and content_part:
            parts.append(content_part)
        elif top2 == "collaborative":
            parts.append(collab_part)
        else:
            parts.append(pop_part)


        parts = list(dict.fromkeys(parts))

        explanation_text = "Recommended because it is " + " and ".join(parts) + "."


        details.update({
            "explanation": explanation_text,
            "contribution_percentages": {
                "Content": content_pct,
                "Collaborative": collab_pct,
                "Popularity": pop_pct
            }
        })

        recommended_items.append(details)


    return {
        "status": "success",
        "recommendations": recommended_items
    }