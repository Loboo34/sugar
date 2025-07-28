import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { create } from 'domain';
import {logger} from "../config/logger"

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            logger.error(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    };
}

export const validateWithFile = (schema: Joi.ObjectSchema, fileRequired: boolean = true) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const bodyToValidate = {...req.body};
           delete bodyToValidate.image;
      const { error } = schema.validate(bodyToValidate);
   
      if (error) {
        logger.error(`Validation error: ${error.details[0].message}`);
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      // Check if file is required and present
      if (fileRequired && !req.file) {
        logger.error("Validation error: Image file is required");
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      // Validate file type if file is present
      if (req.file && !req.file.mimetype.startsWith("image/")) {
        logger.error("Validation error: Only image files are allowed");
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed",
        });
      }
      // Validate file size (5MB limit)
      if (req.file && req.file.size > 5 * 1024 * 1024) {
        logger.error("Validation error: Image size must be less than 5MB");
        return res.status(400).json({
          success: false,
          message: "Image size must be less than 5MB",
        });
      }

      next();
    }
}

export const validationError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.isJoi) {
        logger.error(`Validation error: ${err.details[0].message}`);
        return res.status(400).json({
            success: false,
            message: err.details[0].message
        });
    }
    next(err);
}
   

export const schemas = {
  addProduct: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(5).max(100).required(),
    price: Joi.number().min(0).required(),
    //   image: Joi.string().required(),
    category: Joi.string().required(),
    stock: Joi.number().min(0).required(),
  }),
  updateProduct: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().min(5).max(100).optional(),
    price: Joi.number().min(0).optional(),
    // image: Joi.string().optional(),
    category: Joi.string().optional(),
    stock: Joi.number().min(0).optional(),
  }),
  makeOrder: Joi.object({
    user: Joi.string().optional(),
    products: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      })
    ),

    totalAmount: Joi.number().min(0).required(),
    paymentMethod: Joi.string().valid("cash", "Mpesa").required(),
    phoneNumber: Joi.string().optional(),
  }),
  updateOrder: Joi.object({
    user: Joi.string().optional(),
    products: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .optional(),
    totalAmount: Joi.number().min(0).optional(),
    paymentMethod: Joi.string().valid("cash", "Mpesa").optional(),
  }),
  createStoreItem: Joi.object({
    itemName: Joi.string().min(1).max(100).required(),
    quantity: Joi.number().min(1).required(),
    unit: Joi.string().valid("kg", "g", "liters", "units").required(),
  }),
  updateStoreItem: Joi.object({
    itemName: Joi.string().min(1).max(100).optional(),
    quantity: Joi.number().min(1).optional(),
    unit: Joi.string().valid("kg", "g", "liters", "units").optional(),
  }),
  transferStoreItem: Joi.object({
    quantity: Joi.number().min(1).required(),
    destination: Joi.string().required(),
  }),
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid("attendant", "admin").default("attendant"),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
  }),
};