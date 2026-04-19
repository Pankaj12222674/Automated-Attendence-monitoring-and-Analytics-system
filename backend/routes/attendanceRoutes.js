import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";

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
  getAdvancedAnalytics,
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
  authorize("student", "teacher", "admin"),
  getStudentAttendanceHistory
);

// Advanced Analytics route - MUST BE DEFINED ABOVE /analytics/:studentId to prevent route conflict!
router.get("/analytics/advanced", protect, getAdvancedAnalytics);

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

/* ======================================================
   TEST ENDPOINT - VERIFY ROUTE IS WORKING
====================================================== */
router.get("/test", (req, res) => {
  res.json({ message: "Attendance routes working" });
});

/* ======================================================
   TEACHER ANALYTICS - GET ALL CLASSES & ANALYTICS
====================================================== */
router.get("/teacher/classes", protect, async (req, res) => {
  try {
    console.log("📍 /api/attendance/teacher/classes endpoint hit");
    
    // Verify user is authenticated
    if (!req.user || !req.user._id) {
      console.error("❌ User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const teacherId = req.user._id;
    console.log("👤 Teacher ID:", teacherId);

    // Find all classes where this teacher is assigned
    console.log("🔍 Querying classes for teacher:", teacherId);
    const classes = await Class.find({ teacherId }).lean();
    console.log(`✅ Found ${classes?.length || 0} classes`);

    if (!classes || classes.length === 0) {
      console.log("⚠️ No classes found for this teacher, returning empty array");
      return res.json([]);
    }

    const analytics = [];

    for (let cls of classes) {
      try {
        console.log(`  📊 Processing class: ${cls._id} (${cls.name})`);
        
        const total = await Attendance.countDocuments({ classId: cls._id });
        const present = await Attendance.countDocuments({
          classId: cls._id,
          status: { $in: ["present", "late"] },
        });

        analytics.push({
          classId: cls._id,
          className: cls.name || "Unnamed Class",
          total,
          present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        });
      } catch (classErr) {
        console.error(`  ⚠️ Error processing class ${cls._id}:`, classErr.message);
      }
    }

    console.log("✅ Returning analytics:", analytics.length, "records");
    res.json(analytics);
  } catch (err) {
    console.error("❌ TEACHER ANALYTICS ERROR:", err.message);
    console.error("🔧 Full error:", err);
    console.error("📋 Stack:", err.stack);
    
    res.status(500).json({ 
      message: "Failed to fetch analytics",
      error: err.message,
      errorType: err.name
    });
  }
});

export default router;