import { Router } from "express";
import { getProducts, getProduct, addProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { schemas, validate } from "../middleware/validation.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post("/", validate(schemas.addProduct), addProduct);
router.put("/:id", validate(schemas.updateProduct), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
