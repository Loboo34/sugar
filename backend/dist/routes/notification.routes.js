"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_controller_1 = require("../controllers/Notification.controller");
const router = (0, express_1.Router)();
router.get("/unread", Notification_controller_1.getUnreadNotifications);
router.post("/mark-as-read", Notification_controller_1.markAsRead);
exports.default = router;
