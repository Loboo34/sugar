import React, { useState, useEffect } from "react";
import { Plus, Minus, Search } from "lucide-react";
import { Button } from "./Button";
import type { Product } from "../types";
import { useProductStore } from "../store/product.store";
import { useCartStore } from "../store/cart.store";

const ProductGrid = () => {
  const { fetchProducts, isLoading, products } = useProductStore();
  const { addToCart, items } = useCartStore(); // Add items to access cart
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "all",
    "bread",
    "pastries",
    "beverages",
    "cakes",
    "cookies",
  ];

  // Fix: Add the missing getCartQuantity function
  const getCartQuantity = (productId: string): number => {
    const cartItem = items.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterProducts(); // Fix typo
  }, [searchCategory, searchTerm, products]);

  const filterProducts = () => {
    // Fix typo
    let filtered = products;
    if (searchCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === searchCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  // Improved: Better quantity management with stock validation
  const handleAddToCart = (product: Product, quantityChange: number) => {
    if (quantityChange <= 0) return;

    const currentCartQuantity = getCartQuantity(product.id);
    const newCartQuantity = currentCartQuantity + quantityChange;

    // Prevent adding more than available stock
    if (newCartQuantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    const cartItem = {
      product,
      quantity: quantityChange,
      subtotal: product.price * quantityChange,
    };
    addToCart(cartItem);
  };

  // New: Quick add function for card clicks
  const handleQuickAdd = (product: Product) => {
    handleAddToCart(product, 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSearchCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchCategory === category
                  ? "bg-amber-500 text-white"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product Count Display */}
      <div className="flex items-center justify-between bg-amber-50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-amber-800">
            Products ({filteredProducts.length})
          </h3>
          {searchTerm || searchCategory !== "all" ? (
            <span className="text-sm text-amber-600">
              {filteredProducts.length} of {products.length} products shown
            </span>
          ) : null}
        </div>

        {/* Optional: Add sorting or view options here */}
        <div className="text-sm text-amber-700">
          {searchCategory !== "all" && (
            <span className="bg-amber-200 px-2 py-1 rounded-full">
              Category: {searchCategory}
            </span>
          )}
        </div>
      </div>

      {/* Improved Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const cartQuantity = getCartQuantity(product.id);

          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                product.stock > 0
                  ? "border-amber-200 hover:border-amber-400"
                  : "border-red-200 opacity-60"
              }`}
            >
              {/* Clickable card for quick add */}
              <div
                className="cursor-pointer p-4"
                onClick={() => product.stock > 0 && handleQuickAdd(product)}
              >
                {product.image && (
                  <div className="relative mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {cartQuantity > 0 && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {cartQuantity}
                      </div>
                    )}
                    {/* Stock indicator badge */}
                    <div
                      className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} left`
                        : "Out of stock"}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-lg text-gray-800 mb-1 text-center">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 capitalize mb-2 text-center">
                  {product.category}
                </p>

                <div className="text-center mb-2">
                  <span className="text-2xl font-bold text-amber-600">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Stock display */}
                <div className="text-center mb-3">
                  <span
                    className={`text-sm font-medium ${
                      product.stock > 10
                        ? "text-green-600"
                        : product.stock > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Quantity Controls - Only show if in stock */}
              {product.stock > 0 && (
                <div className="px-4 pb-4">
                  {cartQuantity === 0 ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product, 1);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2"
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between bg-amber-50 rounded-lg p-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, -1);
                        }}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="font-bold text-lg text-amber-600">
                        {cartQuantity}
                      </span>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1);
                        }}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0"
                        disabled={cartQuantity >= product.stock} // Prevent adding more than available
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Warning when stock is low */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="text-xs text-orange-600 text-center mt-1 font-medium">
                      Only {product.stock} left!
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-sm text-gray-400">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "Try a different category"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
