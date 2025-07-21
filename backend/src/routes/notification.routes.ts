import { Router } from "express";
import {getUnreadNotifications, markAsRead} from "../controllers/Notification.controller";

const router = Router();

router.get("/unread", getUnreadNotifications);
router.post("/mark-as-read", markAsRead);

export default router;
