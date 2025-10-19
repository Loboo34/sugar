"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validationError = exports.validateWithFile = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../config/logger");
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            logger_1.logger.error(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    };
};
exports.validate = validate;
const validateWithFile = (schema, fileRequired = true) => {
    return (req, res, next) => {
        const bodyToValidate = Object.assign({}, req.body);
        delete bodyToValidate.image;
        const { error } = schema.validate(bodyToValidate);
        if (error) {
            logger_1.logger.error(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        // Check if file is required and present
        if (fileRequired && !req.file) {
            logger_1.logger.error("Validation error: Image file is required");
            return res.status(400).json({
                success: false,
                message: "Image file is required",
            });
        }
        // Validate file type if file is present
        if (req.file && !req.file.mimetype.startsWith("image/")) {
            logger_1.logger.error("Validation error: Only image files are allowed");
            return res.status(400).json({
                success: false,
                message: "Only image files are allowed",
            });
        }
        // Validate file size (5MB limit)
        if (req.file && req.file.size > 5 * 1024 * 1024) {
            logger_1.logger.error("Validation error: Image size must be less than 5MB");
            return res.status(400).json({
                success: false,
                message: "Image size must be less than 5MB",
            });
        }
        next();
    };
};
exports.validateWithFile = validateWithFile;
const validationError = (err, req, res, next) => {
    if (err.isJoi) {
        logger_1.logger.error(`Validation error: ${err.details[0].message}`);
        return res.status(400).json({
            success: false,
            message: err.details[0].message
        });
    }
    next(err);
};
exports.validationError = validationError;
exports.schemas = {
    addProduct: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        description: joi_1.default.string().min(5).max(100).required(),
        price: joi_1.default.number().min(0).required(),
        //   image: Joi.string().required(),
        category: joi_1.default.string().required(),
        stock: joi_1.default.number().min(0).required(),
    }),
    updateProduct: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        description: joi_1.default.string().min(5).max(100).optional(),
        price: joi_1.default.number().min(0).optional(),
        // image: Joi.string().optional(),
        category: joi_1.default.string().optional(),
        stock: joi_1.default.number().min(0).optional(),
    }),
    makeOrder: joi_1.default.object({
        user: joi_1.default.string().optional(),
        products: joi_1.default.array().items(joi_1.default.object({
            product: joi_1.default.string().required(),
            quantity: joi_1.default.number().min(1).required(),
        })),
        totalAmount: joi_1.default.number().min(0).required(),
        paymentMethod: joi_1.default.string().valid("cash", "Mpesa").required(),
        phoneNumber: joi_1.default.string().optional(),
    }),
    updateOrder: joi_1.default.object({
        user: joi_1.default.string().optional(),
        products: joi_1.default.array()
            .items(joi_1.default.object({
            product: joi_1.default.string().required(),
            quantity: joi_1.default.number().min(1).required(),
        }))
            .optional(),
        totalAmount: joi_1.default.number().min(0).optional(),
        paymentMethod: joi_1.default.string().valid("cash", "Mpesa").optional(),
    }),
    createStoreItem: joi_1.default.object({
        itemName: joi_1.default.string().min(1).max(100).required(),
        quantity: joi_1.default.number().min(1).required(),
        unit: joi_1.default.string().valid("kg", "g", "liters", "units").required(),
    }),
    updateStoreItem: joi_1.default.object({
        itemName: joi_1.default.string().min(1).max(100).optional(),
        quantity: joi_1.default.number().min(1).optional(),
        unit: joi_1.default.string().valid("kg", "g", "liters", "units").optional(),
    }),
    transferStoreItem: joi_1.default.object({
        quantity: joi_1.default.number().min(1).required(),
        destination: joi_1.default.string().required(),
    }),
    register: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        name: joi_1.default.string().min(2).max(100).required(),
        role: joi_1.default.string().valid("attendant", "admin").default("attendant"),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
    }),
    updateProfile: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        email: joi_1.default.string().email().optional(),
        password: joi_1.default.string().min(6).optional(),
    }),
};
