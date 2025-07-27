import axios from "axios";
import { Request, Response } from "express";
import { Buffer } from "buffer";
import { logger } from "../config/logger";
import { getAccessToken } from "./token";
import MpesaTransaction from "../models/mpesa.models";

const generateTimestamp = () => {
  return new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
};

const shortCode = 174379; // Example shortcode, replace with actual
const PASS_KEY = process.env.PASS_KEY;

export const mpesaController = {
  async initiatePayment(req: Request, res: Response) {
    try {
      const { amount, phoneNumber, accountReference, transactionDesc } =
        req.body;

      if (!amount || !phoneNumber) {
        return res
          .status(400)
          .json({ error: "Amount and phone number are required" });
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve access token" });
      }
      const timestamp = generateTimestamp();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const payload = {
        BusinessShortCode: shortCode,
        Password: Buffer.from(`${shortCode}${PASS_KEY}${timestamp}`).toString(
          "base64"
        ),
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BASE_URL}/mpesa/callback`,
        AccountReference: accountReference || "BakersApp",
        TransactionDesc: transactionDesc || "Payment for goods/services",
      };

      const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        payload,
        { headers }
      );

      return res.status(200).json(response.data);
    } catch (error) {
      logger.error("Error initiating payment", error);
      return res.status(500).json({ error: "Failed to initiate payment" });
    }
  },
  
  async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await MpesaTransaction.find();
      return res.status(200).json(transactions);
    } catch (error) {
      logger.error("Error fetching transactions", error);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },
};
