import { useState, useEffect } from "react";

export default function ProductCardTrending({ product }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/get_image?name=${encodeURIComponent(product.name)}`
        );
        const data = await res.json();
        if (data.image) {
          setImageUrl(data.image);
        }
      } catch (err) {
        console.log("Error fetching image:", err);
      }
    }

    fetchImage();
  }, [product.name]);

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-sm hover:shadow-md transition">

      {/* Product Image */}
      <div className="w-full h-32 mb-3 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 text-sm">Loading image...</div>
        )}
      </div>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-gray-900 capitalize">
        {product.name}
      </h3>

      {/* Category */}
      <p className="text-sm text-gray-500 capitalize">
        Category: {product.category}
      </p>

    </div>
  );
}