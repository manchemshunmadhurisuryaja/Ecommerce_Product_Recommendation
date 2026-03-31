import { useState, useEffect } from "react";

export default function ProductCard({ product, onAddToCart }) {

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {

    async function fetchImage() {

      try {

        const res = await fetch(
          `http://127.0.0.1:5000/get_image?name=${product.name}`
        );

        const data = await res.json();

        if (data.image) {
          setImageUrl(data.image);
        }

      } catch (err) {
        console.log(err);
      }

    }

    fetchImage();

  }, [product.name]);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">

      {/* Product Image */}
      <div className="w-full h-32 mb-3 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full object-contain"
          />
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

      {/* Explanation */}
      {product.explanation && (
        <p className="text-xs text-green-600 mt-1">
          {product.explanation}
        </p>
      )}

      {/* Previous Products */}
      {product.previous_products && product.previous_products.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Based on:</p>
          {product.previous_products.map((prev, idx) => (
            <p key={idx} className="text-xs text-gray-700 capitalize">
              • {prev.name}
            </p>
          ))}
        </div>
      )}

    </div>
  );
}