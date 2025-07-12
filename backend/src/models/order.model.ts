import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      enum: ["Distributor", "Customer"],
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"]
        },
        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
            min: [1, "Quantity must be at least 1"]
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount must be a positive number"]
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "Mpesa"],
        required: [true, "Payment method is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model("Order", orderSchema);
export default Order;