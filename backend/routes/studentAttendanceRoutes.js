import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getStudentSummary,
  getStudentAttendanceHistory,   // We have this
  getStudentAnalytics             // We have this
} from "../controllers/attendanceController.js";

const router = express.Router();

/* ======================================================
   STUDENT SUMMARY (All subjects percentage)
====================================================== */
router.get(
  "/summary/:studentId",
  protect,
  authorize("student"),
  getStudentSummary
);

/* ======================================================
   STUDENT FULL ATTENDANCE HISTORY
====================================================== */
router.get(
  "/history/:studentId",
  protect,
  authorize("student"),
  getStudentAttendanceHistory
);

/* ======================================================
   STUDENT ANALYTICS (Monthly + Subject-wise charts)
====================================================== */
router.get(
  "/analytics/:studentId",
  protect,
  authorize("student"),
  getStudentAnalytics
);

export default router;