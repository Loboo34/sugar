import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        enum: ["kg", "g", "liters", "units"]
    },
    stock: {
        type: Number,   },


});

const Store = mongoose.model("Store", storeSchema);

export default Store;