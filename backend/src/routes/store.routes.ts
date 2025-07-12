import Router from 'express';
import { validate, schemas } from '../middleware/validation.middleware';
import {
    createStoreItem,
    getStoreItems,
    updateStoreItem,
    deleteStoreItem,
    transferStoreItem
} from '../controllers/store.controller';

const router = Router();

router.post("/", validate(schemas.createStoreItem), createStoreItem);
router.get("/", getStoreItems);
router.put("/:id", validate(schemas.updateStoreItem), updateStoreItem);
router.delete("/:id", deleteStoreItem);
router.post("/:id/transfer", validate(schemas.transferStoreItem), transferStoreItem);

export default router;