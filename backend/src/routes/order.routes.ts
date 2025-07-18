import { Router } from "express";
import { validate, schemas } from "../middleware/validation.middleware";
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder
} from "../controllers/order.controller";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrder);
router.post("/", validate(schemas.makeOrder), createOrder);
router.put("/:id", validate(schemas.updateOrder), updateOrder);

export default router;
