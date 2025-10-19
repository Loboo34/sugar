"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationShema = new mongoose_1.default.Schema({
    type: {
        type: String,
        required: true,
        enum: ["low_stock", "new_product", "order_received"]
    },
    message: {
        type: String,
        required: true
    },
    //product/item reference
    productId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
    storeId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Store",
        required: false
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Notification = mongoose_1.default.model("Notification", notificationShema);
exports.default = Notification;
