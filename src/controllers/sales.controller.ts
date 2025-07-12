import {Request, Response} from 'express';
import Order from '../models/order.model';
import Store from '../models/store.model';
import {logger} from '../config/logger';

export const getTotalSales = async (req: Request, res: Response) => {
    try {
        const totalSales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalPrice" },
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
            data: totalSales[0],
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
    const { productId} = req.params;
    try{
        const totalSales = await Order.aggregate([
            {
                $match: { "items.productId": productId },
            },
            {
                $unwind: "$items",
            },
            {
                $match: { "items.productId": productId },
            },
            {
                $group: {
                    _id: "$items.productId",
                    totalAmount: { $sum: "$items.price" },
                },
            },
        ]);

        if (totalSales.length === 0) {
            logger.info(`No sales found for product ${productId}`);
            return res.status(200).json({
                success: true,
                data: { totalAmount: 0 },
            });
        }

        logger.info(`Total sales for product ${productId} fetched successfully:`, totalSales[0]);
        res.status(200).json({
            success: true,
            data: totalSales[0],
        });

    } catch(error: any) {
        logger.error(`Error fetching total sales for product ${productId}: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//get total daily/weekly/monthly sales
export const getSalesByTimeframe = async (req: Request, res: Response) => {
    const {timeFrame} = req.params;
    try{
        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - (timeFrame === 'daily' ? 1 : timeFrame === 'weekly' ? 7 : 30))),
                        $lt: new Date(),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalPrice" },
                },
            },
        ]);

        if (salesData.length === 0) {
            logger.info(`No sales found for timeframe ${timeFrame}`);
            return res.status(200).json({
                success: true,
                data: { totalAmount: 0 },
            });
        }

        logger.info(`Total sales for timeframe ${timeFrame} fetched successfully:`, salesData[0]);
        res.status(200).json({
            success: true,
            data: salesData[0],
        });
    } catch (error: any) {
        logger.error(`Error fetching sales for timeframe ${timeFrame}: ${error.message}`);
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

