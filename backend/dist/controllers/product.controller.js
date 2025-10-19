"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateStock = exports.updateProduct = exports.addProduct = exports.getProduct = exports.getProducts = void 0;
const multer_1 = require("../middleware/multer");
const product_model_1 = __importDefault(require("../models/product.model"));
const logger_1 = require("../config/logger");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_model_1.default.find();
        // Map _id to id for each product
        const mapped = products.map((p) => (Object.assign(Object.assign({}, p.toObject()), { id: p._id.toString() })));
        res.status(200).json(mapped);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching products: ${error.message}`);
        res
            .status(500)
            .json({ message: "Error fetching products", error: error.message });
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const product = yield product_model_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Map _id to id for single product
        const mapped = Object.assign(Object.assign({}, product.toObject()), { id: product._id.toString() });
        res.status(200).json(mapped);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching product: ${error.message}`);
        res
            .status(500)
            .json({ message: "Error fetching product", error: error.message });
    }
});
exports.getProduct = getProduct;
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, category, stock } = req.body;
    logger_1.logger.info(`Adding product: ${name}`);
    let imageUrl = "";
    if (req.file) {
        try {
            const result = yield new Promise((resolve, reject) => {
                var _a;
                multer_1.cloudinary.uploader
                    .upload_stream({ resource_type: "image", folder: "products" }, (error, result) => {
                    if (error) {
                        logger_1.logger.error(`Error uploading image: ${error.message}`);
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                })
                    .end((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer);
            });
            imageUrl = result.secure_url;
        }
        catch (error) {
            logger_1.logger.error(`Error uploading image: ${error instanceof Error ? error.message : "Unknown error"}`);
            return res.status(500).json({
                message: "Error uploading image",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    else {
        return res.status(400).json({
            success: false,
            message: "image required",
        });
    }
    try {
        const newProduct = new product_model_1.default({
            name,
            description,
            price,
            image: imageUrl,
            category,
            stock,
        });
        const savedProduct = yield newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: savedProduct,
        });
        logger_1.logger.info("Product added successfully", savedProduct);
    }
    catch (error) {
        logger_1.logger.error(`Error adding product: ${error.message}`);
        res
            .status(500)
            .json({ message: "Error adding product", error: error.message });
    }
});
exports.addProduct = addProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const { name, description, price, category, stock } = req.body;
    logger_1.logger.info(`Updating product: ${productId}`);
    if (!productId) {
        res.status(400).json({ message: "Product ID is required" });
        return;
    }
    let imageUrl;
    if (req.file) {
        try {
            const result = yield new Promise((resolve, reject) => {
                var _a;
                multer_1.cloudinary.uploader
                    .upload_stream({ resource_type: "image", folder: "products" }, (error, result) => {
                    if (error) {
                        logger_1.logger.error(`Error uploading image: ${error.message}`);
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                })
                    .end((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer);
            });
            imageUrl = result.secure_url;
        }
        catch (error) {
            logger_1.logger.error(`Error uploading image: ${error instanceof Error ? error.message : "Unknown error"}`);
            return res.status(500).json({
                message: "Error uploading image",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    const updateData = {};
    if (name)
        updateData.name = name;
    if (description)
        updateData.description = description;
    if (price)
        updateData.price = price;
    if (category)
        updateData.category = category;
    if (stock !== undefined)
        updateData.stock = stock;
    if (imageUrl)
        updateData.image = imageUrl;
    try {
        const existing = yield product_model_1.default.findByIdAndUpdate(productId, updateData, { new: true });
        if (!existing) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: existing,
        });
        logger_1.logger.info("Product updated successfully", existing);
    }
    catch (error) {
        logger_1.logger.error(`Error updating product: ${error.message}`);
        res
            .status(500)
            .json({ message: "Error updating product", error: error.message });
    }
});
exports.updateProduct = updateProduct;
const updateStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const { stock } = req.body;
    logger_1.logger.info(`Updating stock for product: ${productId}`);
    if (!productId || stock === undefined) {
        res.status(400).json({ message: "Product ID and stock are required" });
        return;
    }
    try {
        const product = yield product_model_1.default.findByIdAndUpdate(productId, { stock }, { new: true });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            product,
        });
        logger_1.logger.info("Stock updated successfully", product);
    }
    catch (error) {
        logger_1.logger.error(`Error updating stock: ${error.message}`);
        res
            .status(500)
            .json({ message: "Error updating stock", error: error.message });
    }
});
exports.updateStock = updateStock;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    logger_1.logger.info(`Deleting product: ${productId}`);
    if (!productId) {
        res.status(400).json({ message: "Product ID is required" });
        return;
    }
    try {
        const product = yield product_model_1.default.findByIdAndDelete(productId);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error(`Error deleting product: ${error.message}`);
        res
            .status(500)
            .json({ message: "Error deleting product", error: error.message });
    }
});
exports.deleteProduct = deleteProduct;
