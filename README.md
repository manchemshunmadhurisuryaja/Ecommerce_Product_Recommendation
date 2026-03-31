# 🛒 E-commerce Product Recommendation System

## 📌 Project Overview
This project focuses on developing a Hybrid E-commerce Product Recommendation System that provides personalized product suggestions by analyzing user behavior and product information.

The system combines multiple recommendation techniques including:
- Collaborative Filtering
- Content-Based Filtering
- Popularity-Based Recommendation

By integrating these approaches, the system improves recommendation accuracy, diversity, and handles cold-start problems effectively. 

---

## 🎯 Objective
The main objective of this project is to build an intelligent recommendation system that:
- Provides personalized product suggestions
- Handles cold-start problems for new users
- Improves user experience and product discovery
- Offers explainable recommendations for better user trust 
---

## 🚀 Key Features
- Hybrid Recommendation System (Content + Collaborative + Popularity)
- Cold-start handling using trending & category-based recommendations
- Explainable recommendations (e.g., “based on your previous purchases”)
- Category-based personalized trending products
- Real-time product search functionality
- User preference-based recommendations

---

## 🧠 Methodology

### 1. Content-Based Filtering
- Uses TF-IDF, BM25, Word2Vec
- Recommends similar products based on product features

### 2. Collaborative Filtering
- Uses Alternating Least Squares (ALS)
- Uses BPR (Bayesian Personalized Ranking)
- Learns user behavior patterns from purchase data

### 3. Popularity-Based Model
- Quantity-based
- Reorder-based
- Time-weighted (trending)

### 4. Hybrid Model
- Combines all techniques using:
  - Weighted Hybrid
  - Switching Hybrid
  - Two-Stage Hybrid (Best performing model) 
---

## 📊 Dataset
- Supermarket Dataset for Predictive Marketing
- ~2 million records
- Includes:
  - User ID
  - Product ID
  - Purchase history
  - Reorder information 

---

## ⚙️ Technologies Used

### Backend
- Python
- Flask
- Pandas, NumPy
- Scikit-learn

### Frontend
- React
- Vite
- Tailwind CSS

### Other Tools
- Joblib (Model saving)
- Pexels API (Product images)

---

## 📈 Evaluation Metrics
- Precision@5
- Recall@5
- MRR@5

The Two-Stage Hybrid Model achieved the best performance among all models. 
---

## ❗ Challenges Addressed
- Cold-start problem for new users
- Lack of recommendation diversity
- Lack of explainability in traditional systems

---

## 🔍 Future Improvements
- Handle cold-start for new products
- Real-time model updates
- Dynamic dataset integration
- Improve scalability for large datasets

## Project Structure  
```
E-Commerce-Product-Recommendation
│
├── backend
│   ├── models
│   ├── hybrid_recommender.py
│   ├── popularity_model.py
│   ├── new_user.py
│   └── app.py
│
├── frontend
│   ├── components
│   ├── pages
│   └── App.js
│
└── README.md
```


---

## 🏁 Conclusion
This project demonstrates how combining multiple recommendation techniques improves accuracy, personalization, and user satisfaction. The hybrid model enhances the overall shopping experience and supports efficient product discovery in e-commerce platforms. 

---


## 🚀 How to Run the Project

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/manchemshunmadhurisuryaja/Ecommerce_Product_Recommendation.git
```

### 2️⃣ Navigate to Project Folder

```bash
cd E-Commerce-Product-Recommendation-
```

---

## ⚙️ Backend Setup

### 3️⃣ Navigate to Backend Folder

```bash
cd backend
```

### 4️⃣ Install Required Python Libraries

```bash
pip install flask
pip install flask-cors
pip install pandas
pip install numpy
pip install scikit-learn
pip install requests
```

**OR (Recommended):**

```bash
pip install -r requirements.txt
```

### 5️⃣ Run Backend Server

```bash
python app.py
```

Backend will run at:
👉 http://127.0.0.1:5000

---

## 💻 Frontend Setup

👉 Open a new terminal

### 6️⃣ Navigate to Frontend Folder

```bash
cd frontend
```

### 7️⃣ Install Dependencies

```bash
npm install
```

### 8️⃣ Start React Application

```bash
npm start
```

Frontend will run at:
👉 http://localhost:3000
