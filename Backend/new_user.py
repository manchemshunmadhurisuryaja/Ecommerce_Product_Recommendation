# new_user.py
import pandas as pd
import re

# Load dataset
df = pd.read_csv("Supermarket dataset for predictive marketing 2023.csv")

# Normalize department names in dataset
def normalize(text):
    if pd.isna(text):
        return ""
    return re.sub(r"[^a-z0-9]", "", text.lower())

df['dept_norm'] = df['department'].apply(normalize)

# ------------------- NEW USER SUPPORT -------------------

# Get all departments
def get_departments():
    departments = df['department'].dropna().unique().tolist()
    departments = sorted(departments)
    return {
        "status": "success",
        "departments": departments
    }

# Get popular products by selected department
def get_popular_by_department(department, top_k=20):
    # Normalize selected department
    dept_norm = normalize(department)
    
    dept_data = df[df['dept_norm'] == dept_norm]

    if dept_data.empty:
        return {
            "status": "error",
            "message": f"No products found for selected category '{department}'."
        }

    # Top products by frequency
    popular_ids = (
        dept_data['product_id']
        .value_counts()
        .head(top_k)
        .index
        .tolist()
    )

    top_products = dept_data[dept_data['product_id'].isin(popular_ids)].drop_duplicates('product_id')
    
    results = [
        {
            "product_id": row['product_id'],
            "product_name": row['product_name'],
            "department": row['department']
        }
        for _, row in top_products.iterrows()
    ]

    return {
        "status": "success",
        "department": department,
        "popular_products": results
    }