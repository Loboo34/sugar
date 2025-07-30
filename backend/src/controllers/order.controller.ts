import { Request, Response } from "express";
import Order from "../models/order.model";
import Product from "../models/product.model";
import { logger } from "../config/logger";
import { mpesaController } from "../services/mpesaController";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      //.populate("user")
      .populate("products.product");
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    logger.error(`Error fetching orders: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId)
      //.populate("user")
      .populate("products.product");
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    logger.error(`Error fetching order: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const { user, products, totalAmount, paymentMethod, phoneNumber } = req.body;
  logger.info("Creating order with data:", { reqBody: req.body });
  try {
    if (!products || products.length === 0) {
      logger.warn("No products provided in order");
      return res.status(400).json({
        success: false,
        message: "No products provided in order",
      });
    }
    if (totalAmount < 0) {
      logger.warn("Total amount cannot be negative");
      return res.status(400).json({
        success: false,
        message: "Total amount cannot be negative",
      });
    }
    if (!paymentMethod || !["cash", "Mpesa"].includes(paymentMethod)) {
      logger.warn("Invalid payment method");
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Check stock availability
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        logger.warn(`Product with ID ${item.product} not found`);
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }
      if (item.quantity > product.stock) {
        logger.warn("Insufficient stock for product");
        return res.status(400).json({
          success: false,
          message: "Insufficient stock for product",
        });
      }
    }

    // Update stock
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const newOrder = new Order({
      user,
      products,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "paid" : "pending",
      phoneNumber: paymentMethod === "Mpesa" ? phoneNumber : undefined,
    });
    const savedOrder = await newOrder.save();

    if (
      paymentMethod === "Mpesa" &&
      (!phoneNumber || !/^2547\d{8}$/.test(phoneNumber))
    ) {
      logger.warn("Invalid phone number for Mpesa payment");
      return res.status(400).json({
        success: false,
        message:
          "A valid phone number (format: 2547XXXXXXXX) is required for Mpesa payment",
      });
    }
    if (paymentMethod === "Mpesa") {
      try {
        const mpesa = await mpesaController.initiatePayment({
          amount: totalAmount,
          products,
          phoneNumber,
          accountReference: savedOrder._id.toString(),
          transactionDesc: "Order Payment",
        });
        if (mpesa && mpesa.CheckoutRequestID) {
          savedOrder.mpesaCheckoutRequestID = mpesa.CheckoutRequestID;
          await savedOrder.save();
        }
        // await savedOrder.save();
        logger.info("Order created successfully:", savedOrder);
      } catch (error: any) {
        logger.error(`Error initiating Mpesa payment: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Failed to initiate Mpesa payment",
        });
      }
    }

    res.status(201).json({
      success: true,
      data: savedOrder,
    });
  } catch (error: any) {
    logger.error(`Error creating order: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error: any) {
    logger.error(`Error updating order: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPaidOrders = async (req: Request, res: Response) => {
  try {
    const paidOrders = await Order.find({ paymentStatus: "paid" })
      .populate("products.product")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      data: paidOrders,
      count: paidOrders.length,
    });
  } catch (error: any) {
    logger.error(`Error fetching paid orders: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
