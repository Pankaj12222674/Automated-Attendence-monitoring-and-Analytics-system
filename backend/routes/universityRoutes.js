import express from "express";
import {
  createDepartment,
  createProgram,
  getAllUniversityData,
  enrollMasterStudent
} from "../controllers/universityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all Departments and Programs for the Admin/Teacher dropdowns
router.get("/all", protect, getAllUniversityData);

// Admin: Create a new Department (e.g., Computer Science)
router.post("/create-department", protect, createDepartment);

// Admin: Create a new Degree Program (e.g., B.Tech CS)
router.post("/create-program", protect, createProgram);

// Admin: Master Enroll a Student (Auto-generates RegNo, Password, and Semester 1 Fees)
router.post("/enroll-student", protect, enrollMasterStudent);

export default router;