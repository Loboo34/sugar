import { Request, Response } from "express";
import { cloudinary } from "../middleware/multer";
import Product from "../models/product.model";
import { logger } from "../config/logger";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    // Map _id to id for each product
    const mapped = products.map((p) => ({
      ...p.toObject(),
      id: p._id.toString(),
    }));
    res.status(200).json(mapped);
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    // Map _id to id for single product
    const mapped = { ...product.toObject(), id: product._id.toString() };
    res.status(200).json(mapped);
  } catch (error: any) {
    logger.error(`Error fetching product: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  const { name, description, price, category, stock } = req.body;
  logger.info(`Adding product: ${name}`);

  let imageUrl = "";
  if (req.file) {
    try {
     
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "products" },
            (error, result) => {
              if (error) {
                logger.error(`Error uploading image: ${error.message}`);
                reject(error);
              } else {
                resolve(result); 
              }
            }
          )
          .end(req.file?.buffer);
      });
      imageUrl = result.secure_url;
    } catch (error: unknown) {
      logger.error(
        `Error uploading image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return res.status(500).json({
        message: "Error uploading image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "image required",
    });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      image: imageUrl,
      category,
      stock,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
    });
    logger.info("Product added successfully", savedProduct);
  } catch (error: any) {
    logger.error(`Error adding product: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { name, description, price, category, stock } = req.body;
  logger.info(`Updating product: ${productId}`);
  if (!productId) {
    res.status(400).json({ message: "Product ID is required" });
    return;
  }

  let imageUrl: string | undefined;
  if (req.file) {
    try {
    
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "products" },
            (error, result) => {
              if (error) {
                logger.error(`Error uploading image: ${error.message}`);
                reject(error);
              } else {
                resolve(result); 
              }
            }
          )
          .end(req.file?.buffer);
      });
      imageUrl = result.secure_url; 
    } catch (error: unknown) {
      logger.error(
        `Error uploading image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return res.status(500).json({
        message: "Error uploading image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } 

  const updateData: any = {};
  if(name) updateData.name = name;
  if(description) updateData.description = description;
  if(price) updateData.price =price;
  if(category) updateData.category = category;
  if(stock !== undefined) updateData.stock = stock;
  if(imageUrl) updateData.image = imageUrl;



  try {
    const existing = await Product.findByIdAndUpdate(
      productId,
      updateData,
      
      { new: true }
    );

    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: existing,
    });
    logger.info("Product updated successfully", existing);
  } catch (error: any) {
    logger.error(`Error updating product: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  logger.info(`Deleting product: ${productId}`);
  if (!productId) {
    res.status(400).json({ message: "Product ID is required" });
    return;
  }
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting product: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
