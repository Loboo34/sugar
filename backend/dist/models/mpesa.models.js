"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mpesaSchema = new mongoose_1.default.Schema({
    amount: { type: Number, required: true },
    phoneNumber: { type: String },
    name: { type: String, default: "Unknown" },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
    products: [
        { product: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                default: 1,
            },
            price: {
                type: Number,
            } }
    ],
    order: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order"
    },
    mpesaReceiptNumber: { type: String },
    checkoutRequestId: { type: String },
    merchantRequestId: { type: String },
    resultCode: { type: Number },
    resultDesc: { type: String },
    transactionDate: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const MpesaTransaction = mongoose_1.default.model("MpesaTransaction", mpesaSchema);
exports.default = MpesaTransaction;
