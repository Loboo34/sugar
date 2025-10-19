"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const store_controller_1 = require("../controllers/store.controller");
const router = (0, express_1.default)();
router.get("/", store_controller_1.getStoreItems);
router.get("/transfers/recent", store_controller_1.getRecentTransfers);
router.get("/:id", store_controller_1.getStoreItem);
router.post("/", (0, validation_middleware_1.validate)(validation_middleware_1.schemas.createStoreItem), store_controller_1.createStoreItem);
router.put("/:id", (0, validation_middleware_1.validate)(validation_middleware_1.schemas.updateStoreItem), store_controller_1.updateStoreItem);
router.patch("/:id/quantity", store_controller_1.updateStoreItemQuantity);
router.delete("/:id", store_controller_1.deleteStoreItem);
router.post("/:id/transfer", (0, validation_middleware_1.validate)(validation_middleware_1.schemas.transferStoreItem), store_controller_1.transferStoreItem);
exports.default = router;
