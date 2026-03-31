import pandas as pd

# Load dataset
df = pd.read_csv("Supermarket dataset for predictive marketing 2023.csv")

# Product table
products = df[["product_id", "product_name", "department"]].drop_duplicates()


# -------------------------------
# Get Product Details
# -------------------------------
def get_product_details(product_id):

    product = products[products["product_id"] == product_id]

    if not product.empty:
        return {
            "id": int(product.iloc[0]["product_id"]),
            "name": product.iloc[0]["product_name"],
            "category": product.iloc[0]["department"]
        }

    return None


# -------------------------------
# Category Based Trending
# -------------------------------
def get_trending_products(user_id, top_n=10):

    # 1️⃣ Get user purchase history
    user_data = df[df["user_id"] == user_id]

    # If new user → return global trending
    if user_data.empty:
        trending_ids = (
            df.groupby("product_id")["reordered"]
            .sum()
            .sort_values(ascending=False)
            .head(top_n)
            .index
        )

    else:

        # 2️⃣ Find user preferred category
        user_products = user_data["product_id"]

        user_categories = products[
            products["product_id"].isin(user_products)
        ]["department"]

        top_category = user_categories.mode()[0]

        # 3️⃣ Products in that category
        category_products = products[
            products["department"] == top_category
        ]["product_id"]

        # 4️⃣ Find most reordered in that category
        trending_ids = (
            df[df["product_id"].isin(category_products)]
            .groupby("product_id")["reordered"]
            .sum()
            .sort_values(ascending=False)
            .head(top_n)
            .index
        )

    # 5️⃣ Convert to product objects
    trending_products = [
        get_product_details(pid)
        for pid in trending_ids
    ]

    return trending_products