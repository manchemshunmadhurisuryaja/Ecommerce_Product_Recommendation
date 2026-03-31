import { useState } from "react";

export default function Header({ cartCount = 0, onLogout, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (onSearch) {
      onSearch(value); // send search text to parent
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Search */}
        <div className="flex-1 max-w-md mx-6">
          <input
            type="text"
            placeholder="Search groceries..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}

      </div>
    </header>
  );
}