import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { create } from 'domain';

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    };
}
   

export const schemas = {
    addProduct: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().min(10).max(100).required(),
        price: Joi.number().min(0).required(),
        image: Joi.string().required(),
        category: Joi.string().required(),
        stock: Joi.number().min(0).required()
    }),
    updateProduct: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().min(10).max(100).optional(),
        price: Joi.number().min(0).optional(),
        image: Joi.string().optional(),
        category: Joi.string().optional(),
        stock: Joi.number().min(0).optional()
    }),
    makeOrder: Joi.object({
        user: Joi.string().optional(),
        products: Joi.array().items(
            Joi.object({
                product: Joi.string().required(),
                quantity: Joi.number().min(1).required()
            })
        ),
        totalAmount: Joi.number().min(0).required(),
        paymentMethod: Joi.string().valid("cash", "Mpesa").required()    
    }),
    updateOrder: Joi.object({
        user: Joi.string().optional(),
        products: Joi.array().items(
            Joi.object({
                product: Joi.string().required(),
                quantity: Joi.number().min(1).required()
            })
        ).optional(),
        totalAmount: Joi.number().min(0).optional(),
        paymentMethod: Joi.string().valid("cash", "Mpesa").optional()
    }),
    createStoreItem: Joi.object({
        ItemName: Joi.string().min(1).max(100).required(),
        quantity: Joi.number().min(1).required(),
        quantityType: Joi.string().valid("kg", "g", "liters", "units").required()
    }),
        updateStoreItem: Joi.object({
        ItemName: Joi.string().min(1).max(100).optional(),
        quantity: Joi.number().min(1).optional(),
        quantityType: Joi.string().valid("kg", "g", "liters", "units").optional()
    }),
    transferStoreItem: Joi.object({
        quantity: Joi.number().min(1).required(),
        //destination: Joi.string().required()
    })
}