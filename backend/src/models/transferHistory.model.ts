import mongoose from "mongoose";

const transferHistorySchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
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

const TransferHistory = mongoose.model(
  "TransferHistory",
  transferHistorySchema
);

export default TransferHistory;
