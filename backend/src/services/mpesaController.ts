import axios from "axios";
import { Request, Response } from "express";
import { Buffer } from "buffer";
import { logger } from "../config/logger";
import { getAccessToken } from "./token";

export const mpesaController = {
  async lipaNaMpesaOnline(req: Request, res: Response) {
    try {
      const { amount, phoneNumber } = req.body;

      if (!amount || !phoneNumber) {
        return res
          .status(400)
          .json({ message: "Amount and phone number are required." });
      }

      const accessToken = await getAccessToken();
      const url = process.env.MPESA_LIPA_NA_MPESA_ONLINE_URL;

      if (!url) {
        return res
          .status(500)
          .json({ message: "MPESA URL is not configured." });
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const payload = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: Buffer.from(
          `${process.env.MPESA_SHORTCODE}${
            process.env.MPESA_LIPA_PASSKEY
          }${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14)}`
        ).toString("base64"),
        Timestamp: new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14),
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "Test123",
        TransactionDesc: "Payment for testing",
      };

      const response = await axios.post(url, payload, { headers });

      return res.status(200).json(response.data);
    } catch (error) {
      logger.error("Error in lipaNaMpesaOnline:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the request." });
    }
  },

  async lipaNaMpesaOnlineCallback(req: Request, res: Response) {
    try {
      const callbackData = req.body;

      // Log the callback data for debugging
      logger.info("MPESA Callback Data:", callbackData);

      const result = callbackData.Body.stkCallback;
      if (!result || result.ResultCode !== 0) {
        logger.error("MPESA Callback Error:", result);
        return res.status(400).json({ message: "Invalid callback data." });
      } else {
        logger.info("MPESA Callback Success:", result);
      }

      return res
        .status(200)
        .json({ message: "Callback received successfully." });
    } catch (error) {
      logger.error("Error in lipaNaMpesaOnlineCallback:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the callback." });
    }
  },

  async lipaNaMpesaOnlineStatus(req: Request, res: Response) {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required." });
      }

      const accessToken = await getAccessToken();
      const url = process.env.MPESA_TRANSACTION_STATUS_URL;

      if (!url) {
        return res
          .status(500)
          .json({ message: "MPESA URL is not configured." });
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const payload = {
        CommandID: "TransactionStatusQuery",
        TransactionID: transactionId,
        PartyA: process.env.MPESA_SHORTCODE,
        IdentifierType: "1", // 1 for MSISDN
        ResultURL: process.env.MPESA_RESULT_URL,
        QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
        Remarks: "Transaction status query",
      };

      const response = await axios.post(url, payload, { headers });

      return res.status(200).json(response.data);
    } catch (error) {
      logger.error("Error in lipaNaMpesaOnlineStatus:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the request." });
    }
  },

  async lipaNaMpesaOnlineReversal(req: Request, res: Response) {
    try {
      const { transactionId, amount } = req.body;

      if (!transactionId || !amount) {
        return res
          .status(400)
          .json({ message: "Transaction ID and amount are required." });
      }

      const accessToken = await getAccessToken();
      const url = process.env.MPESA_REVERSAL_URL;

      if (!url) {
        return res
          .status(500)
          .json({ message: "MPESA URL is not configured." });
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const payload = {
        CommandID: "TransactionReversal",
        TransactionID: transactionId,
        Amount: amount,
        ReceiverParty: process.env.MPESA_SHORTCODE,
        ResultURL: process.env.MPESA_RESULT_URL,
        QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
        Remarks: "Reversal of transaction",
      };

      const response = await axios.post(url, payload, { headers });

      return res.status(200).json(response.data);
    } catch (error) {
      logger.error("Error in lipaNaMpesaOnlineReversal:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the request." });
    }
  },
};
