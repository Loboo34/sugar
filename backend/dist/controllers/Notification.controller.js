"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getUnreadNotifications = exports.getNotifications = exports.generateLowItemStockNotification = exports.generateLowProductStockNotification = void 0;
const logger_1 = require("../config/logger");
const product_model_1 = __importDefault(require("../models/product.model"));
const store_model_1 = __importDefault(require("../models/store.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const generateLowProductStockNotification = () => __awaiter(void 0, void 0, void 0, function* () {
    const lowStockThreshold = 5;
    try {
        const lowStock = yield product_model_1.default.find({ stock: { $lt: lowStockThreshold } });
        if (lowStock.length > 0) {
            for (const product of lowStock) {
                const notification = new notification_model_1.default({
                    type: "low_stock",
                    message: `Product ${product.name} is low on stock.`,
                    productId: product._id
                });
                yield notification.save();
                logger_1.logger.info(`Low stock notification created for product: ${product.name}`);
            }
        }
    }
    catch (error) {
        logger_1.logger.error(`Error generating low stock notifications: ${error.message}`);
    }
});
exports.generateLowProductStockNotification = generateLowProductStockNotification;
const generateLowItemStockNotification = () => __awaiter(void 0, void 0, void 0, function* () {
    const lowStockThreshold = 5;
    try {
        const lowStock = yield store_model_1.default.find({ stock: { $lt: lowStockThreshold } });
        if (lowStock.length > 0) {
            for (const item of lowStock) {
                const notification = new notification_model_1.default({
                    type: "low_stock",
                    message: `Item ${item.itemName} is low on stock.`,
                    storeId: item._id
                });
                yield notification.save();
                logger_1.logger.info(`Low stock notification created for item: ${item.itemName}`);
            }
        }
    }
    catch (error) {
        logger_1.logger.error(`Error generating low item stock notifications: ${error.message}`);
    }
});
exports.generateLowItemStockNotification = generateLowItemStockNotification;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield notification_model_1.default.find()
            .populate("productId")
            .populate("storeId");
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching notifications: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getNotifications = getNotifications;
const getUnreadNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unreadNotifications = yield notification_model_1.default.find({ read: false })
            .populate("productId")
            .populate("storeId");
        res.status(200).json({
            success: true,
            data: unreadNotifications,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching unread notifications: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getUnreadNotifications = getUnreadNotifications;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationId = req.params.id;
    try {
        const notification = yield notification_model_1.default.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }
        notification.read = true;
        yield notification.save();
        res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    }
    catch (error) {
        logger_1.logger.error(`Error marking notification as read: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.markAsRead = markAsRead;
