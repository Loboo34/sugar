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
exports.startNotifications = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const order_model_1 = __importDefault(require("../models/order.model"));
const logger_1 = require("../config/logger");
const Notification_controller_1 = require("../controllers/Notification.controller");
const startNotifications = () => {
    node_cron_1.default.schedule("*/10 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger_1.logger.info("Running daily notification tasks");
            yield (0, Notification_controller_1.generateLowProductStockNotification)();
            yield (0, Notification_controller_1.generateLowItemStockNotification)();
            logger_1.logger.info("Daily notification tasks completed successfully");
        }
        catch (error) {
            logger_1.logger.error(`Error in daily notification tasks: ${error.message}`);
        }
    }), {
        timezone: "Africa/Nairobi",
    });
    node_cron_1.default.schedule("*/5 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger_1.logger.info("Running cleanup for abandoned M-Pesa orders");
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            const abandonedOrders = yield order_model_1.default.find({
                paymentStatus: "pending",
                paymentMethod: "Mpesa",
                createdAt: { $lt: fifteenMinutesAgo },
            });
            logger_1.logger.info(`Found ${abandonedOrders.length} abandoned M-Pesa orders`);
            for (const order of abandonedOrders) {
                order.paymentStatus = "timeout";
                order.resultDesc = "Payment timed out - no response received";
                yield order.save();
            }
            logger_1.logger.info(`Marked ${abandonedOrders.length} orders as timed out`);
        }
        catch (error) {
            logger_1.logger.error("Error cleaning up abandoned orders:", error);
        }
    }));
};
exports.startNotifications = startNotifications;
