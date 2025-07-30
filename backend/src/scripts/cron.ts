import cron from "node-cron";
import Order from "../models/order.model"
import { logger } from "../config/logger";
import {
  generateLowItemStockNotification,
  generateLowProductStockNotification,
} from "../controllers/Notification.controller";

export const startNotifications = () => {
  cron.schedule(
    "*/10 * * * *",
    async () => {
      try {
        logger.info("Running daily notification tasks");
        await generateLowProductStockNotification();
        await generateLowItemStockNotification();
        logger.info("Daily notification tasks completed successfully");
      } catch (error: any) {
        logger.error(`Error in daily notification tasks: ${error.message}`);
      }
    },
    {
      timezone: "Africa/Nairobi",
    }
  );

  cron.schedule("*/5 * * * *", async () => {
    try {
      logger.info("Running cleanup for abandoned M-Pesa orders");
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const abandonedOrders = await Order.find({
        paymentStatus: "pending",
        paymentMethod: "Mpesa",
        createdAt: { $lt: fifteenMinutesAgo },
      });

      logger.info(`Found ${abandonedOrders.length} abandoned M-Pesa orders`);

      for (const order of abandonedOrders) {
        order.paymentStatus = "timeout";
        order.resultDesc = "Payment timed out - no response received";
        await order.save();
      }

      logger.info(`Marked ${abandonedOrders.length} orders as timed out`);
    } catch (error) {
      logger.error("Error cleaning up abandoned orders:", error);
    }
  });
};
