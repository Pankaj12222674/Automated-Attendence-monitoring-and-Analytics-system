import express from "express";
import {
  createAssignment,
  getClassAssignments,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getMySubmissions
} from "../controllers/assignmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// STUDENT ROUTES
// ==========================================

// Submit an assignment file/link
router.post("/submit", protect, submitAssignment);

// View my own submissions and grades
router.get("/my-submissions", protect, getMySubmissions);

// ==========================================
// TEACHER / ADMIN ROUTES
// ==========================================
// Note: You can add your role-checking middleware here (e.g., `teacherOnly`) 
// if you have one in your authMiddleware.js. For now, they are protected by login.

// Create a new assignment
router.post("/create", protect, createAssignment);

// View all student submissions for a specific assignment
router.get("/submissions/:assignmentId", protect, getAssignmentSubmissions);

// Grade a specific student's submission
router.put("/grade/:submissionId", protect, gradeSubmission);

// ==========================================
// SHARED ROUTES (Both Students and Teachers)
// ==========================================

// Get all assignments for a specific cohort/class
router.get("/class/:classId", protect, getClassAssignments);

export default router;