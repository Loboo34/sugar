import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

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
    })
}