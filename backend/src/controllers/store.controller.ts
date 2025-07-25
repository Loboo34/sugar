import { Request, Response } from "express";
import Store from "../models/store.model";
import TransferHistory from "../models/transferHistory.model";
import { logger } from "../config/logger";

export const createStoreItem = async (req: Request, res: Response) => {
  const { itemName, quantity, unit } = req.body;
  logger.info("Creating store item with data:", { reqBody: req.body });
  try {
    const newItem = new Store({
      itemName,
      quantity,
      unit,
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
    res.status(200).json(items);
  } catch (error: any) {
    logger.error(`Error fetching store items: ${error.message}`);
    res.status(500).json(error);
  }
};

export const getStoreItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info(`Fetching store item with ID: ${id}`);
  try {
    const item = await Store.findById(id);
    if (!item) {
      logger.error(`Store item with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Store item not found",
      });
    }
    logger.info("Store item fetched successfully:", item);
    res.status(200).json(item);
  } catch (error: any) {
    logger.error(`Error fetching store item: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateStoreItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { itemName, quantity, unit } = req.body;
  logger.info(`Updating store item with ID: ${id}`, { reqBody: req.body });
  try {
    const updatedItem = await Store.findByIdAndUpdate(
      id,
      { itemName, quantity, unit },
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

export const updateStoreItemQuantity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;
  logger.info(`Updating store item quantity with ID: ${id}`, {
    newQuantity: quantity,
  });

  try {
    const item = await Store.findById(id);

    if (!item) {
      logger.error(`Store item with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Store item not found",
      });
    }

    item.quantity = quantity;
    const updatedItem = await item.save();

    logger.info("Store item quantity updated successfully:", updatedItem);
    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    logger.error(`Error updating store item quantity: ${error.message}`);
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

export const transferStoreItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, destination } = req.body;
  logger.info(
    `Transferring ${quantity} of store item with ID: ${id} to ${destination}`
  );
  try {
    const item = await Store.findById(id);
    if (!item) {
      logger.error(`Store item with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Store item not found",
      });
    }

    if (item.quantity < quantity) {
      logger.warn(
        `Insufficient quantity for transfer. Available: ${item.quantity}, Requested: ${quantity}`
      );
      return res.status(400).json({
        success: false,
        message: "Insufficient quantity for transfer",
      });
    }

    // Save transfer history before updating the item
    const transferHistory = new TransferHistory({
      itemId: item._id,
      itemName: item.itemName,
      quantity: quantity,
      unit: item.unit,
      destination: destination,
      transferredAt: new Date(),
    });
    await transferHistory.save();

    // Update the item quantity
    item.quantity -= quantity;
    await item.save();

    logger.info(
      `Transferred ${quantity} of store item with ID ${id} to ${destination} successfully`
    );
    res.status(200).json({
      success: true,
      message: `Transferred ${quantity} of store item to ${destination} successfully`,
      data: item,
    });
  } catch (error: any) {
    logger.error(
      `Error transferring store item to ${destination}: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRecentTransfers = async (req: Request, res: Response) => {
  try {
    logger.info("Fetching recent transfers");
    const recentTransfers = await TransferHistory.find()
      .sort({ transferredAt: -1 })
      .limit(3)
      .lean();

    logger.info("Recent transfers fetched successfully:", recentTransfers);
    res.status(200).json({
      success: true,
      data: recentTransfers,
    });
  } catch (error: any) {
    logger.error(`Error fetching recent transfers: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
