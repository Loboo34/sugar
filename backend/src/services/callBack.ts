import express, { json } from "express";
import { Request, Response } from "express";
import { logger } from "../config/logger";
import MpesaTransaction from "../models/mpesa.models";
import Order from "../models/order.model";

export const callBack = async (req: Request, res: Response) => {
  try {
    logger.info("=== CALLBACK DEBUG INFO ===");
    logger.info("Headers:", JSON.stringify(req.headers, null, 2));
    logger.info("Body:", JSON.stringify(req.body, null, 2));
    logger.info("Raw body:", req.body);
    logger.info("Body type:", typeof req.body);
    logger.info("Body keys:", Object.keys(req.body || {}));
    logger.info("=== END DEBUG INFO ===");

    const body = req.body;

    // Check if body exists and has data
    if (!body || Object.keys(body).length === 0) {
      logger.error("Empty callback body received");
      // Still save a record for debugging
      const transaction = new MpesaTransaction({
        amount: 0,
        phoneNumber: "Unknown",
        name: "Empty Callback",
        status: "failed",
        resultDesc: "Empty callback body received",
      });
      await transaction.save();
      return res.status(200).json({ message: "Empty callback processed" });
    }

    const stkCallback = body.Body?.stkCallback;
    if (!stkCallback) {
      logger.error("Invalid callback structure - missing stkCallback", body);
      const transaction = new MpesaTransaction({
        amount: 0,
        phoneNumber: "Unknown",
        name: "Invalid Structure",
        status: "failed",
        resultDesc: "Invalid callback structure",
      });
      await transaction.save();
      return res.status(200).json({ message: "Invalid callback processed" });
    }

    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const merchantRequestId = stkCallback.MerchantRequestID;

    let amount = 0;
    let phoneNumber = "Unknown";
    let mpesaReceiptNumber = "";
    let transactionDate = "";

    // Extract data from successful transactions
    if (resultCode === 0 && stkCallback.CallbackMetadata) {
      const items = stkCallback.CallbackMetadata.Item;
      logger.info("CallbackMetadata items:", items);

      for (const item of items) {
        switch (item.Name) {
          case "Amount":
            amount = parseFloat(item.Value);
            break;
          case "PhoneNumber":
            phoneNumber = item.Value.toString();
            break;
          case "MpesaReceiptNumber":
            mpesaReceiptNumber = item.Value;
            break;
          case "TransactionDate":
            transactionDate = item.Value.toString();
            break;
        }
      }
    }

    let accountReference = null;
    if (stkCallback.AccountReference) {
      accountReference = stkCallback.AccountReference;
    }

    // Create transaction record
    const transaction = new MpesaTransaction({
      amount: amount,
      phoneNumber: phoneNumber,
      name: mpesaReceiptNumber || "Unknown",
      status: resultCode === 0 ? "success" : "failed",
      mpesaReceiptNumber: mpesaReceiptNumber,
      checkoutRequestId: checkoutRequestId,
      merchantRequestId: merchantRequestId,
      resultCode: resultCode,
      resultDesc: resultDesc,
      transactionDate: transactionDate,
    });

    await transaction.save();
    logger.info("Transaction saved successfully:", {
      amount,
      phoneNumber,
      status: resultCode === 0 ? "success" : "failed",
      mpesaReceiptNumber,
    });

    // After extracting accountReference or CheckoutRequestID from callback:
    const query: any[] = [];
    if (accountReference) query.push({ _id: accountReference });
    if (checkoutRequestId)
      query.push({ mpesaCheckoutRequestID: checkoutRequestId });

    const order = await Order.findOne(query.length ? { $or: query } : {});
    if (order) {
      order.paymentStatus = resultCode === 0 ? "paid" : "failed";
      order.mpesaReceiptNumber = mpesaReceiptNumber;
      await order.save();
    }

    res.status(200).json({ message: "Callback processed successfully" });
  } catch (error) {
    logger.error("Error processing M-Pesa callback:", error);
    return res.status(500).json({ error: "Failed to process callback" });
  }
};
