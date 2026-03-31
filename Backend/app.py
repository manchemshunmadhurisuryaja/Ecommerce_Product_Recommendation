from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pandas as pd

from hybrid_recommender import recommend_two_stage_single
from popularity_model import get_trending_products
from new_user import get_departments, get_popular_by_department

app = Flask(__name__)
CORS(app)

PEXELS_API_KEY = "bJRYyj6u3Z2o8L6brVSOiNLpbuCu7EnF7dmhtD0FoVQH8c0LyN8SYeF3"

# ------------------- LOAD PRODUCTS CSV -------------------
df1 = pd.read_csv("Supermarket dataset for predictive marketing 2023.csv")
df1['product_name'] = df1['product_name'].astype(str)
df1['department'] = df1['department'].astype(str)

# Pre-lowercase columns to make search faster
df1['product_name_lower'] = df1['product_name'].str.lower()
df1['department_lower'] = df1['department'].str.lower()

# ------------------- HOME -------------------
@app.route("/")
def home():
    return "Backend Running"

# ------------------- HYBRID RECOMMENDATION -------------------
@app.route("/recommend/<int:user_id>")
def recommend(user_id):
    recommendations = recommend_two_stage_single(user_id)
    trending = get_trending_products(user_id)
    return jsonify({
        "status": "success",
        "recommendations": recommendations,
        "trending": trending
    })

# ------------------- NEW USER RECOMMENDATION -------------------
@app.route("/new_user_recommend", methods=["POST"])
def new_user_recommend():
    data = request.get_json()
    selected_departments = data.get("departments", [])

    if not selected_departments:
        return jsonify({"status": "error", "message": "No departments selected"})

    all_products = []
    for dept in selected_departments:
        result = get_popular_by_department(dept)
        if result["status"] == "success":
            all_products.extend(result["popular_products"])

    return jsonify({"status": "success", "recommendations": all_products})

# ------------------- GET PRODUCT IMAGE -------------------
@app.route("/get_image")
def get_image():
    product = request.args.get("name")
    url = f"https://api.pexels.com/v1/search?query={product}&per_page=1"
    headers = {"Authorization": PEXELS_API_KEY}
    response = requests.get(url, headers=headers)
    data = response.json()
    if data.get("photos"):
        return jsonify({"image": data["photos"][0]["src"]["medium"]})
    return jsonify({"image": ""})

# ------------------- SEARCH RECOMMENDATION -------------------
@app.route("/search_recommend", methods=["GET"])
def search_recommend():
    query = request.args.get("q", "").lower().strip()
    if not query:
        return jsonify({"status": "error", "message": "No search query provided"})

    # Efficient search using pre-lowercased columns
    matched = df1[
        df1['product_name_lower'].str.contains(query, na=False) |
        df1['department_lower'].str.contains(query, na=False)
    ]

    # Remove duplicates
    unique_products = matched[['product_id', 'product_name', 'department']].drop_duplicates()

    # Convert to JSON-friendly format
    recommendations = [
        {
            "id": int(row['product_id']),
            "name": row['product_name'],
            "category": row['department'],
            "explanation": "Similar to your search"
        }
        for _, row in unique_products.iterrows()
    ]

    return jsonify({"status": "success", "recommendations": recommendations[:20]})

# ------------------- RUN APP -------------------
if __name__ == "__main__":
    app.run(debug=True)