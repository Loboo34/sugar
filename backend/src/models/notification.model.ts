import { read } from "fs";
import mongoose from "mongoose";

const notificationShema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
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

})

const Notification = mongoose.model("Notification", notificationShema);

export default Notification;