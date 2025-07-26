import express, { json } from "express";
import { Request, Response } from "express";



export const callBack = (req: Request, res: Response) => {
  const callbackData = req.body;
  console.log("Callback data received:", callbackData);

  const result = callbackData.Body.stkCallback;
  if (result.ResultCode === 0) {
    console.log("Payment was successful:", result);
    res.status(200).send("Payment successful");
  } else {
    console.error("Payment failed:", result.ResultDesc);
    res.status(400).send("Payment failed");
  }
  res.status(200).send("Callback received");

}
