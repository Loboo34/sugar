import Router from "express";
import { validate, schemas } from "../middleware/validation.middleware";
import {
  createStoreItem,
  getStoreItems,
  getStoreItem,
  updateStoreItem,
  updateStoreItemQuantity,
  deleteStoreItem,
  transferStoreItem,
} from "../controllers/store.controller";

const router = Router();

router.get("/", getStoreItems);
router.get("/:id", getStoreItem);

router.post("/", validate(schemas.createStoreItem), createStoreItem);

router.put("/:id", validate(schemas.updateStoreItem), updateStoreItem);
router.patch("/:id/quantity", updateStoreItemQuantity);
router.delete("/:id", deleteStoreItem);
router.post(
  "/:id/transfer",
  validate(schemas.transferStoreItem),
  transferStoreItem
);

export default router;
