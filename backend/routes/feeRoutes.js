import express from "express";
import {
  generateClassFees,
  getClassFees,
  getMyFees,
  processPayment
} from "../controllers/feeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// STUDENT ROUTES
// ==========================================

// View my own financial account and pending invoices
router.get("/my-fees", protect, getMyFees);

// Make a payment on a specific invoice
router.post("/pay/:feeId", protect, processPayment);

// ==========================================
// ADMIN / BURSAR ROUTES
// ==========================================

// Generate bulk invoices for an entire cohort/class
router.post("/generate", protect, generateClassFees);

// View all invoices and payment statuses for a specific cohort
router.get("/class/:classId", protect, getClassFees);

export default router;