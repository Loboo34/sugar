import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    ItemName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    quantityType: {
        type: String,
        required: true,
        enum: ["kg", "g", "liters", "units"]
    },

});

const Store = mongoose.model("Store", storeSchema);

export default Store;