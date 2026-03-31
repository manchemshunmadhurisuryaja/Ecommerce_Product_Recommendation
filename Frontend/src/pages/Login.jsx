import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);

const handleGetRecommendations = async () => {
  if (!selectedUser) return;

  setLoading(true);

  try {
    const response = await fetch(
      `http://localhost:5000/recommend/${selectedUser}`
    );

    const data = await response.json();

    console.log("Backend Response:", data);

    // ❌ user not found
    if (data.recommendations.status === "error") {
      toast.error("User does not exist. Please register as a new user.");
      return;
    }

    // ✅ extract product list
   const products = data.recommendations.recommendations || [];
const trending_products = data.trending || []; // <-- fix this line
    console.log("Products Sent to Dashboard:", products);

    navigate("/dashboard", {
      state: {
        recommendedProducts: products,
        trendingProducts: trending_products,
        userId: selectedUser
      }
    });

  } catch (error) {
    toast.error("Server not running or connection error");
  } finally {
    setLoading(false);
  }
};

  const handleNewUser = () => {
    navigate("/new-user");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="w-full max-w-md">

        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          Hybrid Recommendation System
        </h1>

        <p className="text-gray-500 text-center mb-10 text-sm">
          Discover personalized recommendations tailored to your market preferences
        </p>

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Enter User ID
            </label>

            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGetRecommendations();
              }}
              placeholder="Enter your User ID"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={!selectedUser || loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>

        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          onClick={handleNewUser}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition active:scale-95 border border-gray-300"
        >
          New User
        </button>

        <p className="text-xs text-gray-400 text-center mt-8">
          Get personalized grocery recommendations based on your preferences
        </p>

      </div>
    </div>
  );
}