import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import {
  schemas,
  validate,
  validateWithFile,
} from "../middleware/validation.middleware";
import { multerUpload } from "../middleware/multer";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  multerUpload.single("image"),
  validateWithFile(schemas.addProduct, true),
  addProduct
);
router.put(
  "/:id",
  multerUpload.single("image"),
  validateWithFile(schemas.updateProduct, false),
  updateProduct
);
router.delete("/:id", deleteProduct);

export default router;
