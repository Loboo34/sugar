import  { useState, useEffect } from "react";
import { Plus, Minus, Search, Package } from "lucide-react";
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

  const getCartQuantity = (productId: string): number => {
    const cartItem = items.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
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
  }, [searchCategory, searchTerm, products]);

  const handleAddToCart = (product: Product, quantityChange: number) => {
    if (quantityChange <= 0) return;

    const currentCartQuantity = getCartQuantity(product.id);
    const newCartQuantity = currentCartQuantity + quantityChange;

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
    <div className="space-y-8 max-w-none w-full">
      {/* Search and Filter */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border-2 border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xl shadow-lg"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSearchCategory(category)}
              className={`px-6 py-3 rounded-2xl text-lg font-medium transition-all duration-200 ${
                searchCategory === category
                  ? "bg-amber-600 text-white shadow-lg transform scale-105"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200 hover:scale-105"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product Count Display */}
      <div className="flex items-center justify-between bg-amber-50 rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <h3 className="text-2xl font-semibold text-amber-800">
            Products ({filteredProducts.length})
          </h3>
          {searchTerm || searchCategory !== "all" ? (
            <span className="text-lg text-amber-600">
              {filteredProducts.length} of {products.length} products shown
            </span>
          ) : null}
        </div>

        <div className="text-lg text-amber-700">
          {searchCategory !== "all" && (
            <span className="bg-amber-200 px-4 py-2 rounded-full">
              Category: {searchCategory}
            </span>
          )}
        </div>
      </div>

      {/*  Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const cartQuantity = getCartQuantity(product.id);

          return (
            <div
              key={product.id}
              className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                product.stock > 0
                  ? "border border-gray-100 hover:border-amber-300"
                  : "border border-red-200 opacity-75"
              }`}
              style={{ minHeight: "320px" }}
            >
              {/* Product Image Section */}
              <div className="relative overflow-hidden h-48">
                {product.image ? (
                  <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-lg text-white mb-1 leading-tight drop-shadow-lg">
                        {product.name}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full capitalize border border-white/30">
                        {product.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center relative">
                    <Package className="h-12 w-12 text-amber-300 mb-2" />
                    <h3 className="font-bold text-lg text-amber-600 text-center px-3 leading-tight">
                      {product.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full capitalize mt-1">
                      {product.category}
                    </span>
                  </div>
                )}

                {/* Cart Quantity Badge */}
                {cartQuantity > 0 && (
                  <div className="absolute -top-2 -right-2 z-1">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
                      <span className="text-sm font-bold">{cartQuantity}</span>
                    </div>
                  </div>
                )}

                {/* Stock Status Badge */}
                <div className="absolute top-2 left-2 z-1">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                      product.stock > 10
                        ? "bg-emerald-100/90 text-emerald-700 border border-emerald-200/50"
                        : product.stock > 0
                        ? "bg-amber-100/90 text-amber-700 border border-amber-200/50"
                        : "bg-red-100/90 text-red-700 border border-red-200/50"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </div>
                </div>

                {/* Quick Add Overlay */}
                {product.stock > 0 && cartQuantity === 0 && (
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
                    onClick={() => handleQuickAdd(product)}
                  >
                    <div className="bg-white rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Plus className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="p-4">
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-sm">each</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {product.stock > 0 ? (
                  <div className="space-y-4">
                    {cartQuantity === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1);
                        }}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            In Cart
                          </span>
                          <span className="text-lg font-bold text-amber-600">
                            {cartQuantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product, -1);
                            }}
                            className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product, 1);
                            }}
                            disabled={cartQuantity >= product.stock}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Low Stock Warning */}
                    {product.stock <= 5 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <p className="text-amber-700 text-xs font-medium text-center">
                          ⚠️ Only {product.stock} left!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 font-medium text-center text-sm">
                      Out of Stock
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <p className="text-gray-500 text-2xl mb-2">No products found</p>
          <p className="text-lg text-gray-400">
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
