import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import Store from "../models/store.model";
import { logger } from "../config/logger";

export const getTotalSales = async (req: Request, res: Response) => {
  try {
    const totalSales = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
          productName: {$first: "$productDetails.name"},
         // productImage: {$first: "$productDetails.image"},
         // productPrice: {$first: "$productDetails.price"},
          productCategory: {$first: "$productDetails.category"},
          totalAmount: {
            $sum: { $multiply: ["$productDetails.price", "$products.quantity"] },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          totalQuantity: 1,
          totalAmount: 1,
          totalOrders: 1,
          product: {
            name: "$productName",
            category: "$productCategory",
            // image: "$productImage",
            // price: "$productPrice",
          }
        },
      },
    ]);

    if (totalSales.length === 0) {
      logger.info("No sales found");
      return res.status(200).json({
        success: true,
        data: { totalAmount: 0 },
      });
    }

    logger.info("Total sales fetched successfully:", totalSales[0]);
    res.status(200).json({
      success: true,
      data: totalSales,
    });
  } catch (error: any) {
    logger.error(`Error fetching total sales: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTotalSalesForProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const totalSales = await Order.aggregate([
     {$unwind: "$products"},
     {$match: { "products.product": new mongoose.Types.ObjectId(productId) }},
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
          totalAmount: {
            $sum: { $multiply: ["$productDetails.price", "$products.quantity"] },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          totalQuantity: 1,
          totalAmount: 1,
          totalOrders: 1,
          product: "$productDetails"
        },
      },
    ]);

    if (totalSales.length === 0) {
      logger.info(`No sales found for product ${productId}`);
      return res.status(200).json({
        success: true,
        data: { totalAmount: 0, totalQuantity: 0, totalOrders: 0 },
      });
    }

    logger.info(
      `Total sales for product ${productId} fetched successfully:`,
      totalSales[0]
    );
    res.status(200).json({
      success: true,
      data: totalSales[0],
    });
  } catch (error: any) {
    logger.error(
      `Error fetching total sales for product ${productId}: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get total daily/weekly/monthly sales
export const getSalesByTimeframe = async (req: Request, res: Response) => {
  const { timeFrame } = req.params;
 try{
    const matchStage: any = {};
    if (timeFrame === "daily") {
      matchStage.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (timeFrame === "weekly") {
      matchStage.createdAt = { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) };
    } else if (timeFrame === "monthly") {
      matchStage.createdAt = { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) };
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$products.quantity" },
          totalAmount: { $sum: { $multiply: ["$productDetails.price", "$products.quantity"] } },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalAmount: 1,
          totalOrders: 1,
        },
      },
    ]);

    if (salesData.length === 0) {
      logger.info(`No sales found for ${timeFrame}`);
      return res.status(200).json({
        success: true,
        data: { totalAmount: 0, totalQuantity: 0, totalOrders: 0 },
      });
    }

    logger.info(`Sales data for ${timeFrame} fetched successfully`, salesData[0]);
    res.status(200).json({
      success: true,
      data: salesData[0],
    });
  } catch (error: any) {
    logger.error(`Error fetching sales by timeframe ${timeFrame}: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};    

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Store.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$expenses" },
        },
      },
    ]);

    if (expenses.length === 0) {
      logger.info("No expenses found");
      return res.status(200).json({
        success: true,
        data: { totalExpenses: 0 },
      });
    }

    logger.info("Total expenses fetched successfully:", expenses[0]);
    res.status(200).json({
      success: true,
      data: expenses[0],
    });
  } catch (error: any) {
    logger.error(`Error fetching total expenses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
