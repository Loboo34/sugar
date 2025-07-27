import mongoose from "mongoose";

const mpesaSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, default: "Unknown" },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const MpesaTransaction = mongoose.model("MpesaTransaction", mpesaSchema);

export default MpesaTransaction;