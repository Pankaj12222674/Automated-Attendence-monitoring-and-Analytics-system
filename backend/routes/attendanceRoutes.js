import express from "express";
import { protect, authorize } from "../middleware/auth.js";

import {
  markAttendance,
  markFaceAttendance,
  markQRAttendance,
  getClassAttendance,
  getStudentSummary,
  getStudentAttendanceHistory,
  getStudentAnalytics,
  getClassStudents,
  getClassAnalytics,
  getTeacherAttendanceHistory,
} from "../controllers/attendanceController.js";

const router = express.Router();

/* ======================================================
   TEACHER MARK MANUAL ATTENDANCE
====================================================== */
router.post(
  "/mark",
  protect,
  authorize("teacher"),
  markAttendance
);

/* ======================================================
   FACE RECOGNITION ATTENDANCE
====================================================== */
router.post(
  "/face-attendance",
  protect,
  authorize("teacher"),
  markFaceAttendance
);

/* ======================================================
   QR ATTENDANCE
====================================================== */
router.post(
  "/qr-attendance",
  protect,
  authorize("teacher", "student"),
  markQRAttendance
);

/* ======================================================
   VIEW CLASS ATTENDANCE BY DATE
====================================================== */
router.get(
  "/class/:classId/:subjectId/:date",
  protect,
  authorize("teacher", "admin"),
  getClassAttendance
);

/* ======================================================
   TEACHER ATTENDANCE HISTORY (CLASS + SUBJECT)
   Example:
   /api/attendance/history?classId=123&subjectId=456
====================================================== */
router.get(
  "/history",
  protect,
  authorize("teacher"),
  getTeacherAttendanceHistory
);

/* ======================================================
   STUDENT SUMMARY
====================================================== */
router.get(
  "/summary/:studentId",
  protect,
  authorize("student"),
  getStudentSummary
);

/* ======================================================
   STUDENT FULL HISTORY
====================================================== */
router.get(
  "/student/history/:studentId",
  protect,
  authorize("student"),
  getStudentAttendanceHistory
);

/* ======================================================
   STUDENT ATTENDANCE ANALYTICS (Charts)
====================================================== */
router.get(
  "/analytics/:studentId",
  protect,
  authorize("student"),
  getStudentAnalytics
);

/* ======================================================
   CLASS STUDENTS LIST
====================================================== */
router.get(
  "/class/students/:classId",
  protect,
  authorize("teacher", "admin"),
  getClassStudents
);

/* ======================================================
   CLASS ANALYTICS - Per Student Attendance %
====================================================== */
router.get(
  "/class-analytics/:classId",
  protect,
  authorize("teacher", "admin"),
  getClassAnalytics
);

export default router;