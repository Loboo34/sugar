import {Request, Response} from 'express';
import Product from "../models/product.model";
import {logger} from '../config/logger';


export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error: any) {
        logger.error(`Error fetching products: ${error.message}`);
        res.status(500).json({message: "Error fetching products", error: error.message});
    }
}

export const getProduct = async(req: Request, res: Response) => {
    try{
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
         res.status(404).json({message: "Product not found"});
         return;
        }
        res.status(200).json(product);
    } catch(error: any) {
        logger.error(`Error fetching product: ${error.message}`);
        res.status(500).json({message: "Error fetching product", error: error.message});
    }
}

export const addProduct = async(req: Request, res: Response) => {
    const{ name, description, price, image, category, stock} = req.body;
    logger.info(`Adding product: ${name}`);
    try {
        const newProduct = new Product({
            name, description, price, image, category, stock
        });
        const savedProduct = await newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: savedProduct
        });
        logger.info("Product added successfully", savedProduct);
    } catch (error: any) {
        logger.error(`Error adding product: ${error.message}`);
        res.status(500).json({message: "Error adding product", error: error.message});
    }
}

export const updateProduct = async(req:Request, res:Response) => {
    const productId = req.params.id;
    const {name, description, price, image, category, stock} = req.body;
    logger.info(`Updating product: ${productId}`);
    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }
    try{
   
        const existing = await Product.findByIdAndUpdate(productId, {
            name, description, price, image, category, stock
        }, {new: true});

        if(!existing) {
            res.status(404).json({message: "Product not found"});
            return;
        }
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: existing
        });
        logger.info("Product updated successfully", existing);
    } catch (error: any) {
        logger.error(`Error updating product: ${error.message}`);
        res.status(500).json({message: "Error updating product", error: error.message});
    }
}


export const deleteProduct = async(req: Request, res: Response) => {
    const productId = req.params.id;
    logger.info(`Deleting product: ${productId}`);
    if (!productId) {
        res.status(400).json({message: "Product ID is required"});
        return;
    }
    try{
        const product = await Product.findByIdAndDelete(productId);
        if(!product) {
            res.status(404).json({message: "Product not found"});
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error: any) {
        logger.error(`Error deleting product: ${error.message}`);
        res.status(500).json({message: "Error deleting product", error: error.message});
    }
}

