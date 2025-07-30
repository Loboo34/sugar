import React, { useState, useEffect } from "react";
import { X,  Package } from "lucide-react";
import { Button } from "./Button";
import { useInventoryStore } from "../store/inventory.store";
import type { Item } from "../types/index";

interface AddItemProps {
  onClose: () => void;
  item?: Item | null;
}

const AddItem: React.FC<AddItemProps> = ({ onClose, item }) => {
  const { addItem, isLoading, updateItem } = useInventoryStore();
  const [isVisible, setIsVisible] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: 1,
    unit: "", // Default unit
  });
  const isUpdate = !!item;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  const units = ["pcs", "kg", "liters"];
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemName) newErrors.itemName = "Item name is required.";
    if (formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than zero.";
    if (!formData.unit) newErrors.unit = "Unit is required.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isUpdate && item) {
      try {
        await updateItem(item.id, formData as Item);
        setFormData({
          itemName: "",
          quantity: 1,
          unit: "",
        });
        setErrors({});
        handleClose();
      } catch (error) {
        console.error("Error updating item", error);
      }
    } else {
      try {
        await addItem(formData as Item);
        setFormData({
          itemName: "",
          quantity: 1,
          unit: "",
        });
        setErrors({});
        handleClose();
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) : value,
    }));
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isVisible ? "blur(4px)" : "blur(0px)",
      }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">
              {isUpdate ? "Update Item" : "Add New Item"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:rotate-90 transform"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                errors.itemName
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder="Enter item name"
            />
            {errors.itemName && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                  errors.quantity
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.quantity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                  errors.unit
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Select unit
                </option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.unit}
                </p>
              )}
            </div>
          </div>

          {/* Improved Buttons */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1 py-3 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              className="flex-1 py-3 text-base font-medium bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            >
              {isLoading ? "Adding Item..." : isUpdate ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
