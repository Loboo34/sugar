import mongoose from "mongoose";

const productShema = new mongoose.Schema({
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
        required: [true, "Product image is required"]
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

const Product = mongoose.model("Product", productShema);
export default Product;