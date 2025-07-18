import React, { useState, useEffect } from "react";
import { X, Upload, Package, Image } from "lucide-react";
import { Button } from "./Button";
import { useProductStore } from "../store/product.store";
import type { Product } from "../types";

interface AddProductProps {
  onClose: () => void;
  product?: Product | null; // <-- add this
}

const AddProduct: React.FC<AddProductProps> = ({ onClose, product }) => {
  const { createProduct, update_product, isLoading } = useProductStore();
  const [isVisible, setIsVisible] = useState(false);
  const isEdit = !!product

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "",
    stock: product?.stock ?? 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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

    if (!imageFile && !isEdit) {
      newErrors.image = "Product image is required";
    }

    if (formData.stock < 0) {
      newErrors.stock = "Stock must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if(product) {
      setFormData({
        name: product.name,
        description: product.description,
        price:product.price.toString(),
        category:product.category,
        stock:product.stock
      });
      setImagePreview(product.image || "");
      setImageFile(null);
    }
  }, [product]);

    const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock.toString());

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

    try{
      if(isEdit && product) {
        await update_product(product.id, formDataToSend);
      } else {
          await createProduct(formDataToSend);
      }
         handleClose();
    } catch (error) {
      console.error("Error creating/updating product:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to create/update product. Please try again.",
      }));
    }
  } catch (error) {
      console.error("Error creating product:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to create product. Please try again.",
      }));
    }
  }



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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear any existing errors
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    // Reset the file input
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
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

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Product Image *
            </label>

            {!imagePreview ? (
              <div className="relative">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    errors.image
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-amber-500"
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 text-center">
                    Click to upload image
                    <br />
                    <span className="text-xs text-gray-500">
                      Supports: JPG, PNG, GIF (Max 5MB)
                    </span>
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600">{imageFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      {imageFile
                        ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errors.image && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.image}
              </p>
            )}
          </div>

          {/* Stock Input */}
          <div className="grid grid-cols-2 gap-6">
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

          {/* Buttons */}
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
