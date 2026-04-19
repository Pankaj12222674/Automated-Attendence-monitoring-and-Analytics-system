import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMyNotifications,
  markAsRead,
  sendBulkNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Require login for receiving notifications
router.use(protect);

router.get("/my-notifications", getMyNotifications);
router.patch("/:id/read", markAsRead);

// Only admins and teachers can send bulk notifications
router.post("/send-bulk", authorize("admin", "teacher"), sendBulkNotification);

export default router;
