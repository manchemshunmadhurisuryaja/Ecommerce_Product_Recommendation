import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";

export default function NewUser() {
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Store recommendations in state to prevent loss
  const [storedRecommendations, setStoredRecommendations] = useState([]);

  // Store recommendations when they're fetched
  useEffect(() => {
    if (recommendations.length > 0) {
      setStoredRecommendations(recommendations);
    }
  }, [recommendations]);

  const categories = [
    { id: "pantry", label: "Pantry" },
    { id: "dairy_eggs", label: "Dairy & Eggs" },
    { id: "produce", label: "Produce" },
    { id: "canned_goods", label: "Canned Goods" },
    { id: "meat_seafood", label: "Meat & Seafood" },
    { id: "frozen", label: "Frozen" },
    { id: "bakery", label: "Bakery" },
    { id: "beverages", label: "Beverages" },
    { id: "breakfast", label: "Breakfast" },
    { id: "snacks", label: "Snacks" },
    { id: "international", label: "International" },
    { id: "household", label: "Household" },
    { id: "personal_care", label: "Personal Care" },
    { id: "babies", label: "Babies" },
    { id: "deli", label: "Deli" },
    { id: "dry_goods_pasta", label: "Dry Goods & Pasta" },
    { id: "alcohol", label: "Alcohol" },
    { id: "pets", label: "Pets" },
    { id: "bulk", label: "Bulk" },
    { id: "other", label: "Other" },
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleShowRecommendations = async () => {
    if (selectedCategories.length === 0) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/new_user_recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departments: selectedCategories,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setRecommendations(data.recommendations);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Prevent browser back button when recommendations are shown
  useEffect(() => {
    if (!showRecommendations) return;

    const handlePopState = (e) => {
      const confirmLeave = window.confirm("Do you want to sign out?");
      if (confirmLeave) {
        navigate("/", { replace: true });
      } else {
        // Stay on the page by pushing the current state back
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    // Push initial state to prevent going back
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showRecommendations, navigate]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }

    const fetchSearch = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/search_recommend?q=${encodeURIComponent(
            debouncedQuery
          )}`
        );
        const data = await res.json();
        if (data.status === "success") {
          setSearchResults(data.recommendations);
        }
      } catch (err) {
        console.log("Search API error:", err);
      }
    };

    fetchSearch();
  }, [debouncedQuery]);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Header after recommendations */}
      {showRecommendations && (
        <Header cartCount={cartCount} onLogout={handleLogout} onSearch={handleSearch} />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sign Out
            </h3>
            <p className="text-gray-600 mb-6">
              Do you want to sign out?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Right Button */}
      {!showRecommendations && (
        <div className="flex justify-end p-6">
          <button
            onClick={handleBackToLogin}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-gray-500 transition"
          >
            Back to Login
          </button>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">
            Welcome! Tell Us What You Like
          </h1>
          <p className="text-gray-500">
            Select categories to personalize recommendations
          </p>
        </div>

        {!showRecommendations ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`py-3 px-4 rounded-xl font-semibold transition ${
                    selectedCategories.includes(category.id)
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleShowRecommendations}
              disabled={selectedCategories.length === 0}
              className="mt-10 mx-auto block w-full max-w-md py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
            >
              Show Recommendations
            </button>
          </>
        ) : (
          <>
            {searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Search Results for "{debouncedQuery}"
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id || product.product_id}
                      product={{
                        name: product.name || product.product_name,
                        category: product.category || product.department,
                        explanation: product.explanation || "",
                      }}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>

                {storedRecommendations.length === 0 ? (
                  <p className="text-gray-500">
                    No products found for selected categories.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {storedRecommendations.map((product) => (
                      <ProductCard
                        key={product.product_id}
                        product={{
                          name: product.product_name,
                          category: product.department
                        }}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}