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
exports.getPaidOrders = exports.updateOrder = exports.createOrder = exports.getOrder = exports.getAllOrders = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const logger_1 = require("../config/logger");
const mpesaController_1 = require("../services/mpesaController");
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find()
            //.populate("user")
            .populate("products.product");
        res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching orders: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getAllOrders = getAllOrders;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    try {
        const order = yield order_model_1.default.findById(orderId)
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
    }
    catch (error) {
        logger_1.logger.error(`Error fetching order: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getOrder = getOrder;
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, products, totalAmount, paymentMethod, phoneNumber } = req.body;
    logger_1.logger.info("Creating order with data:", { reqBody: req.body });
    try {
        if (!products || products.length === 0) {
            logger_1.logger.warn("No products provided in order");
            return res.status(400).json({
                success: false,
                message: "No products provided in order",
            });
        }
        if (totalAmount < 0) {
            logger_1.logger.warn("Total amount cannot be negative");
            return res.status(400).json({
                success: false,
                message: "Total amount cannot be negative",
            });
        }
        if (!paymentMethod || !["cash", "Mpesa"].includes(paymentMethod)) {
            logger_1.logger.warn("Invalid payment method");
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }
        // Check stock availability
        for (const item of products) {
            const product = yield product_model_1.default.findById(item.product);
            if (!product) {
                logger_1.logger.warn(`Product with ID ${item.product} not found`);
                return res.status(400).json({
                    success: false,
                    message: `Product with ID ${item.product} not found`,
                });
            }
            if (item.quantity > product.stock) {
                logger_1.logger.warn("Insufficient stock for product");
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock for product",
                });
            }
        }
        // Update stock
        for (const item of products) {
            const product = yield product_model_1.default.findById(item.product);
            if (product) {
                product.stock -= item.quantity;
                yield product.save();
            }
        }
        const newOrder = new order_model_1.default({
            user,
            products,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "cash" ? "paid" : "pending",
            phoneNumber: paymentMethod === "Mpesa" ? phoneNumber : undefined,
        });
        const savedOrder = yield newOrder.save();
        if (paymentMethod === "Mpesa" &&
            (!phoneNumber || !/^2547\d{8}$/.test(phoneNumber))) {
            logger_1.logger.warn("Invalid phone number for Mpesa payment");
            return res.status(400).json({
                success: false,
                message: "A valid phone number (format: 2547XXXXXXXX) is required for Mpesa payment",
            });
        }
        if (paymentMethod === "Mpesa") {
            try {
                const mpesa = yield mpesaController_1.mpesaController.initiatePayment({
                    amount: totalAmount,
                    products,
                    phoneNumber,
                    accountReference: savedOrder._id.toString(),
                    transactionDesc: "Order Payment",
                });
                if (mpesa && mpesa.CheckoutRequestID) {
                    savedOrder.mpesaCheckoutRequestID = mpesa.CheckoutRequestID;
                    yield savedOrder.save();
                }
                // await savedOrder.save();
                logger_1.logger.info("Order created successfully:", savedOrder);
            }
            catch (error) {
                logger_1.logger.error(`Error initiating Mpesa payment: ${error.message}`);
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
    }
    catch (error) {
        logger_1.logger.error(`Error creating order: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.createOrder = createOrder;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    try {
        const updatedOrder = yield order_model_1.default.findByIdAndUpdate(orderId, req.body, {
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
    }
    catch (error) {
        logger_1.logger.error(`Error updating order: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.updateOrder = updateOrder;
const getPaidOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paidOrders = yield order_model_1.default.find({ paymentStatus: "paid" })
            .populate("products.product")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: paidOrders,
            count: paidOrders.length,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching paid orders: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getPaidOrders = getPaidOrders;
