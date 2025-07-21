import { Request, Response } from "express";
import { logger } from "../config/logger";
import Product from "../models/product.model";
import Store from "../models/store.model";
import Notification from "../models/notification.model";


export const generateLowProductStockNotification = async () => {
    const lowStockThreshold = 5; 
    try {
        const lowStock = await Product.find({ stock: { $lt: lowStockThreshold } });
        if (lowStock.length > 0) {
            for (const product of lowStock) {
                const notification = new Notification({
                    type: "low_stock",
                    message: `Product ${product.name} is low on stock.`,
                    productId: product._id
                });
                await notification.save();
                logger.info(`Low stock notification created for product: ${product.name}`);
            }
        }
    } catch (error: any) {
        logger.error(`Error generating low stock notifications: ${error.message}`);
    }
}

export const generateLowItemStockNotification = async () => {
    const lowStockThreshold = 5; 
    try {
        const lowStock = await Store.find({ stock: { $lt: lowStockThreshold } });
        if (lowStock.length > 0) {
            for (const item of lowStock) {
                const notification = new Notification({
                    type: "low_stock",
                    message: `Item ${item.itemName} is low on stock.`,
                    storeId: item._id
                });
                await notification.save();
                logger.info(`Low stock notification created for item: ${item.itemName}`);
            }
        }
    } catch (error: any) {
        logger.error(`Error generating low item stock notifications: ${error.message}`);
    }
}

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find()
            .populate("productId")
            .populate("storeId");
        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error: any) {
        logger.error(`Error fetching notifications: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getUnreadNotifications = async (req: Request, res: Response) => {
    try {
        const unreadNotifications = await Notification.find({ read: false })
            .populate("productId")
            .populate("storeId");
        res.status(200).json({
            success: true,
            data: unreadNotifications,
        });
    } catch (error: any) {
        logger.error(`Error fetching unread notifications: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const markAsRead = async (req: Request, res: Response) => {
    const notificationId = req.params.id;
    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }
        notification.read = true;
        await notification.save();
        res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (error: any) {
        logger.error(`Error marking notification as read: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

