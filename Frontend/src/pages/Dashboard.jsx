import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductCardTrending from "../components/ProductCardTrending";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Store products in state to prevent loss on history manipulation
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [userId, setUserId] = useState("User");

  // Initialize data from location.state once
  useEffect(() => {
    if (location.state) {
      if (location.state.recommendedProducts) {
        setRecommendedProducts(location.state.recommendedProducts);
      }
      if (location.state.trendingProducts) {
        setTrendingProducts(location.state.trendingProducts);
      }
      if (location.state.userId) {
        setUserId(location.state.userId);
      }
    }
  }, []);

  const handleAddToCart = () => setCartCount((prev) => prev + 1);
  
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

  // Prevent browser back button
  useEffect(() => {
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
  }, [navigate]);

  // ------------------- SEARCH HANDLER -------------------
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // ------------------- DEBOUNCE SEARCH -------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // wait 300ms

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

  // ------------------- Section Component -------------------
  const Section = ({ title, products, CardComponent }) => {
    if (!products || products.length === 0)
      return (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          <p className="text-gray-500">No products found</p>
        </section>
      );

    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <CardComponent
              key={product.id || product.product_id}
              product={{
                name: product.name || product.product_name,
                category: product.category || product.department,
                explanation: product.explanation || "",
                previous_products: product.previous_products || []
              }}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <Header
        cartCount={cartCount}
        onLogout={handleLogout}
        onSearch={handleSearch} // Backend search
      />

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

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, User {userId}!
          </h1>
          <p className="text-gray-500">
            Check out what we recommend for you today
          </p>
        </div>

        {searchResults.length > 0 ? (
          <Section
            title={`Search Results for "${debouncedQuery}"`}
            products={searchResults}
            CardComponent={ProductCard}
          />
        ) : (
          <>
            <Section
              title="Recommended For You"
              products={recommendedProducts}
              CardComponent={ProductCard}
            />
            <Section
              title="Trending Now"
              products={trendingProducts}
              CardComponent={ProductCardTrending}
            />
          </>
        )}
      </main>
    </div>
  );
}