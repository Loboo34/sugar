import React, { useState, useEffect } from "react";
import { X, Upload, Package } from "lucide-react";
import { Button } from "./Button";
import { useProductStore } from "../store/product.store";
import type { Product } from "../types";

interface AddProductProps {
  onClose: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onClose }) => {
  const { createProduct, isLoading } = useProductStore();
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Bread & Rolls",
    "Cakes & Pastries",
    "Cookies & Biscuits",
    "Muffins & Cupcakes",
    "Pies & Tarts",
    "Beverages",
    "Other",
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required";
    }

    if (formData.stock < 0) {
      newErrors.stock = "Stock must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const productData: Omit<Product, "id"> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        category: formData.category,
        stock: formData.stock,
      };

      await createProduct(productData as Product);
      handleClose();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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
            <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                errors.name
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                errors.description
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.description}
              </p>
            )}
          </div>

          {/* Price and Category - Flex Layout */}
          <div className="flex gap-4">
            {/* Improved Price Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Price (KSH) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  KSH
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    errors.price
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.price}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                  errors.category
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Image URL *
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                errors.image
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.image && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.image}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div className="transform transition-all duration-300 ease-out animate-fadeIn">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto transition-all duration-300 hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* In Stock */}
          <div className="grid grid-cols-2 gap-6">
            {/* Enhanced Stock Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Stock Quantity *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    errors.stock
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="0"
                />
                <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              {errors.stock && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.stock}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Status
              </label>
              <div className="flex items-center h-12 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    formData.stock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    formData.stock > 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {formData.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
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
              {isLoading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
