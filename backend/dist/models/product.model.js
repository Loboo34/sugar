"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productShema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price must be a positive number"]
    },
    image: {
        type: String,
    },
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
        min: [0, "Stock must be a positive number"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Product = mongoose_1.default.model("Product", productShema);
exports.default = Product;
