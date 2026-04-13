import express from "express";
import { generateQR, scanQR } from "../controllers/qrController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = express.Router();

router.post("/generate", protect, authorize("teacher"), generateQR);
router.post("/scan", protect, scanQR); // students may scan too (teacher opens camera to scan student's QR token)
export default router;
