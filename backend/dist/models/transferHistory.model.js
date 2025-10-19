"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transferHistorySchema = new mongoose_1.default.Schema({
    itemId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
        enum: ["kitchen", "shop"],
    },
    transferredAt: {
        type: Date,
        default: Date.now,
    },
    transferredBy: {
        type: String,
        default: "admin", // You can modify this to track actual user
    },
});
const TransferHistory = mongoose_1.default.model("TransferHistory", transferHistorySchema);
exports.default = TransferHistory;
