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
exports.getRecentTransfers = exports.transferStoreItem = exports.deleteStoreItem = exports.updateStoreItemQuantity = exports.updateStoreItem = exports.getStoreItem = exports.getStoreItems = exports.createStoreItem = void 0;
const store_model_1 = __importDefault(require("../models/store.model"));
const transferHistory_model_1 = __importDefault(require("../models/transferHistory.model"));
const logger_1 = require("../config/logger");
const createStoreItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemName, quantity, unit } = req.body;
    logger_1.logger.info("Creating store item with data:", { reqBody: req.body });
    try {
        const newItem = new store_model_1.default({
            itemName,
            quantity,
            unit,
        });
        const savedItem = yield newItem.save();
        logger_1.logger.info("Store item created successfully:", savedItem);
        if (!savedItem) {
            logger_1.logger.error("Failed to save store item");
            return res.status(500).json({
                success: false,
                message: "Failed to create store item",
            });
        }
        res.status(201).json({
            success: true,
            data: savedItem,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error creating store item: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.createStoreItem = createStoreItem;
const getStoreItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("Fetching all store items");
    try {
        const items = yield store_model_1.default.find();
        logger_1.logger.info("Store items fetched successfully:", items);
        res.status(200).json(items);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching store items: ${error.message}`);
        res.status(500).json(error);
    }
});
exports.getStoreItems = getStoreItems;
const getStoreItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    logger_1.logger.info(`Fetching store item with ID: ${id}`);
    try {
        const item = yield store_model_1.default.findById(id);
        if (!item) {
            logger_1.logger.error(`Store item with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: "Store item not found",
            });
        }
        logger_1.logger.info("Store item fetched successfully:", item);
        res.status(200).json(item);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching store item: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getStoreItem = getStoreItem;
const updateStoreItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { itemName, quantity, unit } = req.body;
    logger_1.logger.info(`Updating store item with ID: ${id}`, { reqBody: req.body });
    try {
        const updatedItem = yield store_model_1.default.findByIdAndUpdate(id, { itemName, quantity, unit }, { new: true });
        if (!updatedItem) {
            logger_1.logger.error(`Store item with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: "Store item not found",
            });
        }
        logger_1.logger.info("Store item updated successfully:", updatedItem);
        res.status(200).json({
            success: true,
            data: updatedItem,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error updating store item: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.updateStoreItem = updateStoreItem;
const updateStoreItemQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { quantity } = req.body;
    logger_1.logger.info(`Updating store item quantity with ID: ${id}`, {
        newQuantity: quantity,
    });
    try {
        const item = yield store_model_1.default.findById(id);
        if (!item) {
            logger_1.logger.error(`Store item with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: "Store item not found",
            });
        }
        item.quantity = quantity;
        const updatedItem = yield item.save();
        logger_1.logger.info("Store item quantity updated successfully:", updatedItem);
        res.status(200).json({
            success: true,
            data: updatedItem,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error updating store item quantity: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.updateStoreItemQuantity = updateStoreItemQuantity;
const deleteStoreItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    logger_1.logger.info(`Deleting store item with ID: ${id}`);
    try {
        const deletedItem = yield store_model_1.default.findByIdAndDelete(id);
        if (!deletedItem) {
            logger_1.logger.error(`Store item with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: "Store item not found",
            });
        }
        logger_1.logger.info("Store item deleted successfully:", deletedItem);
        res.status(200).json({
            success: true,
            message: "Store item deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error(`Error deleting store item: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.deleteStoreItem = deleteStoreItem;
const transferStoreItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { quantity, destination } = req.body;
    logger_1.logger.info(`Transferring ${quantity} of store item with ID: ${id} to ${destination}`);
    try {
        const item = yield store_model_1.default.findById(id);
        if (!item) {
            logger_1.logger.error(`Store item with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: "Store item not found",
            });
        }
        if (item.quantity < quantity) {
            logger_1.logger.warn(`Insufficient quantity for transfer. Available: ${item.quantity}, Requested: ${quantity}`);
            return res.status(400).json({
                success: false,
                message: "Insufficient quantity for transfer",
            });
        }
        // Save transfer history before updating the item
        const transferHistory = new transferHistory_model_1.default({
            itemId: item._id,
            itemName: item.itemName,
            quantity: quantity,
            unit: item.unit,
            destination: destination,
            transferredAt: new Date(),
        });
        yield transferHistory.save();
        // Update the item quantity
        item.quantity -= quantity;
        yield item.save();
        logger_1.logger.info(`Transferred ${quantity} of store item with ID ${id} to ${destination} successfully`);
        res.status(200).json({
            success: true,
            message: `Transferred ${quantity} of store item to ${destination} successfully`,
            data: item,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error transferring store item to ${destination}: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.transferStoreItem = transferStoreItem;
const getRecentTransfers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.logger.info("Fetching recent transfers");
        const recentTransfers = yield transferHistory_model_1.default.find()
            .sort({ transferredAt: -1 })
            .limit(3)
            .lean();
        logger_1.logger.info("Recent transfers fetched successfully:", recentTransfers);
        res.status(200).json({
            success: true,
            data: recentTransfers,
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching recent transfers: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getRecentTransfers = getRecentTransfers;
