
import express from "express";

import {
  registerUser,
  loginUser,
  getUserById,
  getProfile,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ============================
        AUTH ROUTES
============================ */

// Register user (with profile image)
router.post(
  "/register",
  upload.single("profileImage"),   // FIXED FIELD NAME
  registerUser
);

// Login
router.post("/login", loginUser);

/* ============================
        PASSWORD RESET
============================ */

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* ============================
        USER PROFILE
============================ */

router.get("/me", protect, getProfile);
router.get("/me/:id", protect, getUserById);

export default router;

