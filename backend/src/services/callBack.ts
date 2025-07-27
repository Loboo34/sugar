import express, { json } from "express";
import { Request, Response } from "express";
import { logger } from "../config/logger";
import MpesaTransaction from "../models/mpesa.models";



export const callBack = (req: Request, res: Response) => {
 try {
    const body = req.body;
    logger.info("Callback received:", body);
  
    // Save the callback data to the database
    const transaction = new MpesaTransaction({
      ...body,
      status: "pending", // Set initial status
    });
  
    transaction.save()
      .then(() => {
        logger.info("Transaction saved successfully");
        res.status(200).json({ message: "Callback processed successfully" });
      })
      .catch((error) => {
        logger.error("Error saving transaction:", error);
        res.status(500).json({ error: "Failed to save transaction" });
      });
 } catch (error) {
   logger.error("Error processing callback", error);
   return res.status(500).json({ error: "Failed to process callback" });
 }

}
