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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-amber-600 text-sm sm:text-base">
            Manage products and ingredients
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-amber-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
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
  const { products, removeProduct, fetchProducts, updateStock, isLoading } =
    useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [stockUpdates, setStockUpdates] = useState<{ [id: string]: number }>(
    {}
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleDelete = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      if (!id || deletingId) return;

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

  // Handler for inline stock change
  const handleStockInput = (id: string, value: number) => {
    setStockUpdates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handler to save all stock updates
  const handleSaveStocks = async () => {
    try {
      // Update all changed stocks
      const updatePromises = Object.entries(stockUpdates).map(([id, stock]) =>
        updateStock(id, stock)
      );

      await Promise.all(updatePromises);
      setStockUpdates({});
      await fetchProducts();

      // Show success message
      alert("Stock updates saved successfully!");
    } catch (error) {
      console.error("Error saving stock updates:", error);
      alert("Failed to save stock updates. Please try again.");
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

      {/*  Stock Update Table */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h3 className="text-lg font-semibold text-amber-800">
            Quick Stock Update
          </h3>
          {Object.keys(stockUpdates).length > 0 && (
            <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-full self-start sm:self-auto">
              {Object.keys(stockUpdates).length} changes pending
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-left hidden sm:table-cell">
                  Category
                </th>
                <th className="py-2 text-left">Current Stock</th>
                <th className="py-2 text-left">Update Stock</th>
                <th className="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const hasChanges = stockUpdates[product.id] !== undefined;
                const newStock = stockUpdates[product.id] ?? product.stock;
                return (
                  <tr
                    key={product.id}
                    className={`border-b last:border-none ${
                      hasChanges ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="py-2 font-medium truncate max-w-[120px] sm:max-w-none">
                      {product.name}
                      {/* Mobile category display */}
                      <div className="sm:hidden mt-1">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-2">
                      <span
                        className={`font-medium ${
                          product.stock <= 5 ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        value={newStock}
                        onChange={(e) =>
                          handleStockInput(product.id, Number(e.target.value))
                        }
                        className={`border rounded px-2 py-1 w-16 sm:w-20 focus:ring-2 focus:ring-amber-500 text-sm ${
                          hasChanges
                            ? "border-amber-400 bg-amber-50"
                            : "border-gray-300"
                        }`}
                      />
                    </td>
                    <td className="py-2">
                      {hasChanges ? (
                        <span className="text-xs text-amber-600 font-medium">
                          Modified
                        </span>
                      ) : newStock <= 5 ? (
                        <span className="text-xs text-red-600 font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
          <div className="text-sm text-gray-600">
            {Object.keys(stockUpdates).length > 0 ? (
              <span>
                Click "Save All" to apply {Object.keys(stockUpdates).length}{" "}
                changes
              </span>
            ) : (
              <span>Make changes to stock quantities above</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {Object.keys(stockUpdates).length > 0 && (
              <Button
                onClick={() => setStockUpdates({})}
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Reset Changes
              </Button>
            )}
            <Button
              onClick={handleSaveStocks}
              disabled={Object.keys(stockUpdates).length === 0}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm ${
                Object.keys(stockUpdates).length > 0
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save All Stock Updates
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                          <img
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/api/placeholder/48/48";
                            }}
                          />
                        </div>
                        <div className="ml-2 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                            {product.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-xs">
                            {product.description}
                          </div>
                          {/* Mobile category display */}
                          <div className="sm:hidden mt-1">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        KSH {product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          product.stock <= 5 ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {product.stock}
                      </div>
                      {/* Mobile status display */}
                      <div className="md:hidden mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-600 hover:bg-amber-50 p-1 sm:p-2"
                          onClick={() => {
                            setEditProduct(product);
                            setIsOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 p-1 sm:p-2"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isOpen && (
        <AddProduct
          onClose={() => {
            setIsOpen(false);
            setEditProduct(null);
          }}
          product={editProduct}
        />
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
  const { items, fetchItems, removeItem, isLoading, updateQuantity } =
    useInventoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [update, setUpdate] = useState<Item | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quantityUpdates, setQuantityUpdates] = useState<{
    [id: string]: number;
  }>({});
  const [updatingQuantity, setUpdatingQuantity] = useState<{
    [id: string]: boolean;
  }>({});

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setQuantityUpdates((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  };

  const handleQuantityUpdate = async (itemId: string) => {
    const newQuantity = quantityUpdates[itemId];
    if (newQuantity === undefined || newQuantity < 0) return;

    try {
      setUpdatingQuantity((prev) => ({ ...prev, [itemId]: true }));
      await updateQuantity(itemId, newQuantity);
      setQuantityUpdates((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } catch (error) {
      console.error("Error updating item quantity:", error);
    } finally {
      setUpdatingQuantity((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || deletingId) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      await removeItem(id);
      await fetchItems();
      //toast.success("Item deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete item";
      console.error(errorMessage);
      // toast.error(errorMessage);
    } finally {
      setDeletingId(null);
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

      {/* Items Table */}
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider hidden sm:table-cell">
                    Unit
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                          </div>
                        </div>
                        <div className="ml-2 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.itemName}
                          </div>
                          {/* Mobile unit display */}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            Unit: {item.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          className="w-16 sm:w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          value={quantityUpdates[item.id] ?? item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                        {quantityUpdates[item.id] !== undefined && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 text-xs text-amber-600 border-amber-600 hover:bg-amber-50"
                            onClick={() => handleQuantityUpdate(item.id)}
                            disabled={updatingQuantity[item.id]}
                          >
                            {updatingQuantity[item.id] ? "..." : "Save"}
                          </Button>
                        )}
                      </div>
                      {/* Mobile status display */}
                      <div className="md:hidden mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.quantity > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.quantity > 0 ? "Available" : "Out of Stock"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.quantity > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.quantity > 0 ? "Available" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-600 hover:bg-amber-50 p-1 sm:p-2"
                          onClick={() => {
                            setUpdate(item);
                            setIsOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 p-1 sm:p-2"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isOpen && (
        <AddItem
          onClose={() => {
            setIsOpen(false);
            setUpdate(null);
          }}
          item={update}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-amber-600">
            {items.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {safeItems.filter((item) => item.quantity > 0).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">In Stock</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-red-600">
            {safeItems.filter((item) => item.quantity === 0).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Out of Stock</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-orange-600">
            {/* {
              items.filter(
                (item) =>
                  item.minimumStock && item.quantity <= item.minimumStock
              ).length
            } */}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Low Stock</div>
        </div>
      </div>
    </div>
  );
};
