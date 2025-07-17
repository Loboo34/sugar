import React, { useCallback, useEffect, useState } from "react";
import { Settings, Package, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../components/Button";
import { useProductStore } from "../store/product.store";
import { useInventoryStore } from "../store/inventory.store";
import AddProduct from "../components/AddProduct";
import type { Product } from "../types";
import AddItem from "../components/AddItem";
import type { Item } from "../types";

export const Management = () => {
  const [activeTab, setActiveTab] = useState<"products" | "items">("products");
  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "items", label: "Items", icon: Settings },
  ];
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-amber-600">Manage products and ingredients</p>
        </div>

        <div className="mb-6">
          <div className="border-b border-amber-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {activeTab === "products" && <ProductManagement />}
        {activeTab === "items" && <ItemsManagement />}
      </div>
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const {
    products,
    update_product,
    removeProduct,
    fetchProducts,
    fetchProduct,
    isLoading,
  } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleDelete = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      // Stop event propagation if event is provided
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      // Prevent multiple simultaneous delete operations
      if (!id || deletingId) return;

      // Confirm deletion
      if (
        !window.confirm(
          "Are you sure you want to delete this product? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        setDeletingId(id);
        await removeProduct(id);
        await fetchProducts();
        //toast.success("Product deleted successfully");
      } catch (error: unknown) {
        console.error("Error deleting product:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete product";
        console.error(errorMessage);
        // toast.error(errorMessage);
      } finally {
        setDeletingId(null);
      }
    },
    [removeProduct, fetchProducts, deletingId]
  );

  const handleUpdate = async (id: string, data: Product) => {
    if (window.confirm("Are you sure you want to update this product?")) {
      await update_product(id, data);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Product Management
          </h2>
          <p className="text-gray-600">Manage your bakery products</p>
        </div>
        <Button
          onClick={toggleModal}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isOpen && <AddProduct onClose={toggleModal} />}

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first product"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/api/placeholder/300/200";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <span className="text-lg font-bold text-amber-600">
                    KSH {product.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-amber-600 border-amber-600 hover:bg-amber-50"
                    onClick={() => {
                      /* Handle edit */
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deletingId === product.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {products.length}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.stock > 0).length}
          </div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stock === 0).length}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};

const ItemsManagement: React.FC = () => {
  const { items, fetchItems, isLoading } = useInventoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      console.log("Deleting item with ID:", id);
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Item Management</h2>
          <p className="text-gray-600">
            Manage your bakery ingredients and supplies
          </p>
        </div>
        <Button
          onClick={toggleModal}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {isOpen && <AddItem onClose={toggleModal} />}

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first item"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Item Header */}
              <div className="h-16 bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center relative">
                <Package className="h-8 w-8 text-amber-600" />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.quantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.quantity > 0 ? "Available" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Item Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.itemName}
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  {/* {item.minimumStock && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Min Stock:</span>
                      <span
                        className={`text-sm font-medium ${
                          item.quantity <= item.minimumStock
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {item.minimumStock} {item.unit}
                      </span>
                    </div>
                  )} */}
                </div>

                {/* Low Stock Warning */}
                {/* {item.minimumStock && item.quantity <= item.minimumStock && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ Low stock alert
                    </p>
                  </div>
                )} */}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-amber-600 border-amber-600 hover:bg-amber-50"
                    onClick={() => {
                      /* Handle edit */
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {items.length}
          </div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {safeItems.filter((item) => item.quantity > 0).length}
          </div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {safeItems.filter((item) => item.quantity === 0).length}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {/* {
              items.filter(
                (item) =>
                  item.minimumStock && item.quantity <= item.minimumStock
              ).length
            } */}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
      </div>
    </div>
  );
};
