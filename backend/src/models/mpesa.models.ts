import mongoose from "mongoose";

const mpesaSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  phoneNumber: { type: String },
  name: { type: String, default: "Unknown" },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  products: {
    type: mongoose.schema.Types.ObjectId,
    ref: "Product"
  },
  mpesaReceiptNumber: { type: String },
  checkoutRequestId: { type: String },
  merchantRequestId: { type: String },
  resultCode: { type: Number },
  resultDesc: { type: String },
  transactionDate: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const MpesaTransaction = mongoose.model("MpesaTransaction", mpesaSchema);

export default MpesaTransaction;
