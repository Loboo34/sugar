import React, { useState } from "react";
import { Settings, Package, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../components/Button";
import { useProductStore } from "../store/product.store";
import { useInventoryStore } from "../store/inventory.store";
import AddProduct from "../components/AddProduct";
export const Management = () => {
    const [activeTab, setActiveTab] = useState<"products" | "items">("products");
    const tabs = [
       { id: 'products', label: 'Products', icon: Package },
    { id: 'items', label: 'Items', icon: Settings }]
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
    const {products, createProduct, update_product, removeProduct, fetchProducts } = useProductStore();

    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const [isOpen, setIsOpen] = useState(false);
 
    const toggleModal = () => {
        setIsOpen(!isOpen);
    };


  return (
    <div>
          <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        <Button onClick={toggleModal}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>
      {isOpen && <AddProduct onClose={toggleModal} />}
    </div>
  )
};

const ItemsManagement: React.FC = () => {
    const {items, addItem, updateItem, removeItem, fetchItems } = useInventoryStore();
    React.useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    return(
        <div>
             <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Item Management</h2>
        <Button>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
        </div>
    )
}


