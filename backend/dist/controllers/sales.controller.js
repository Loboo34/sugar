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
exports.getExpenses = exports.getSalesByTimeframe = exports.getTotalSalesForProduct = exports.getTotalSales = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = __importDefault(require("../models/order.model"));
const store_model_1 = __importDefault(require("../models/store.model"));
const logger_1 = require("../config/logger");
const getTotalSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalSales = yield order_model_1.default.aggregate([
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
                    productName: { $first: "$productDetails.name" },
                    // productImage: {$first: "$productDetails.image"},
                    // productPrice: {$first: "$productDetails.price"},
                    productCategory: { $first: "$productDetails.category" },
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
            logger_1.logger.info("No sales found");
            return res.status(200).json({
                success: true,
                data: { totalAmount: 0 },
            });
        }
        logger_1.logger.info("Total sales fetched successfully:", totalSales[0]);
        res.status(200).json({
            success: true,
            data: totalSales,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching total sales: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getTotalSales = getTotalSales;
const getTotalSalesForProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    try {
        const totalSales = yield order_model_1.default.aggregate([
            { $unwind: "$products" },
            { $match: { "products.product": new mongoose_1.default.Types.ObjectId(productId) } },
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
            logger_1.logger.info(`No sales found for product ${productId}`);
            return res.status(200).json({
                success: true,
                data: { totalAmount: 0, totalQuantity: 0, totalOrders: 0 },
            });
        }
        logger_1.logger.info(`Total sales for product ${productId} fetched successfully:`, totalSales[0]);
        res.status(200).json({
            success: true,
            data: totalSales[0],
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching total sales for product ${productId}: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getTotalSalesForProduct = getTotalSalesForProduct;
//get total daily/weekly/monthly sales
const getSalesByTimeframe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeFrame } = req.params;
    try {
        const matchStage = {};
        if (timeFrame === "daily") {
            matchStage.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
        }
        else if (timeFrame === "weekly") {
            matchStage.createdAt = { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) };
        }
        else if (timeFrame === "monthly") {
            matchStage.createdAt = { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) };
        }
        const salesData = yield order_model_1.default.aggregate([
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
            logger_1.logger.info(`No sales found for ${timeFrame}`);
            return res.status(200).json({
                success: true,
                data: { totalAmount: 0, totalQuantity: 0, totalOrders: 0 },
            });
        }
        logger_1.logger.info(`Sales data for ${timeFrame} fetched successfully`, salesData[0]);
        res.status(200).json({
            success: true,
            data: salesData[0],
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching sales by timeframe ${timeFrame}: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getSalesByTimeframe = getSalesByTimeframe;
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield store_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: "$expenses" },
                },
            },
        ]);
        if (expenses.length === 0) {
            logger_1.logger.info("No expenses found");
            return res.status(200).json({
                success: true,
                data: { totalExpenses: 0 },
            });
        }
        logger_1.logger.info("Total expenses fetched successfully:", expenses[0]);
        res.status(200).json({
            success: true,
            data: expenses[0],
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching total expenses: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getExpenses = getExpenses;
