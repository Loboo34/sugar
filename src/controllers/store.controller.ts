import { Request, Response } from "express";
import Store from "../models/store.model";
import logger from "../config/logger";

export const createStoreItem = async (req: Request, res: Response) => {
  const { ItemName, quantity, quantityType } = req.body;
  logger.info("Creating store item with data:", { reqBody: req.body });
  try {
    const newItem = new Store({
      ItemName,
      quantity,
      quantityType,
    });

    const savedItem = await newItem.save();
    logger.info("Store item created successfully:", savedItem);
    if (!savedItem) {
      logger.error("Failed to save store item");
      return res.status(500).json({
        success: false,
        message: "Failed to create store item",
      });
    }
    res.status(201).json({
      success: true,
      data: savedItem,
    });
  } catch (error: any) {
    logger.error(`Error creating store item: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStoreItems = async (req: Request, res: Response) => {
  logger.info("Fetching all store items");
  try {
    const items = await Store.find();
    logger.info("Store items fetched successfully:", items);
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    logger.error(`Error fetching store items: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateStoreItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ItemName, quantity, quantityType } = req.body;
  logger.info(`Updating store item with ID: ${id}`, { reqBody: req.body });
  try {
    const updatedItem = await Store.findByIdAndUpdate(
      id,
      { ItemName, quantity, quantityType },
      { new: true }
    );

    if (!updatedItem) {
      logger.error(`Store item with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Store item not found",
      });
    }

    logger.info("Store item updated successfully:", updatedItem);
    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    logger.error(`Error updating store item: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteStoreItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info(`Deleting store item with ID: ${id}`);
  try {
    const deletedItem = await Store.findByIdAndDelete(id);

    if (!deletedItem) {
      logger.error(`Store item with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Store item not found",
      });
    }

    logger.info("Store item deleted successfully:", deletedItem);
    res.status(200).json({
      success: true,
      message: "Store item deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting store item: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

