import express from "express";
import { protect, authorize } from "../middleware/auth.js";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,

  getAdminStats,
  getFullAdminData,

  createTimetable,
  getClassTimetable,
  getTeacherTimetable,

  sendAnnouncement,
  getAnnouncements,

  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,

  getAuditLogs,
  getAdminSettings,
  updateAdminSettings,
  updateFeeStatus,

  enterMarks,
  getResults
} from "../controllers/adminController.js";

const router = express.Router();

/* =====================================================
   USER APPROVAL & MANAGEMENT
===================================================== */
router.get("/pending-users", protect, authorize("admin"), getPendingUsers);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/approve/:userId", protect, authorize("admin"), approveUser);
router.put("/reject/:userId", protect, authorize("admin"), rejectUser);
router.delete("/reject/:userId", protect, authorize("admin"), rejectUser);

/* =====================================================
   DASHBOARD / SYSTEM DATA
===================================================== */
router.get("/stats", protect, authorize("admin"), getAdminStats);
router.get("/full-data", protect, authorize("admin"), getFullAdminData);

/* =====================================================
   FACULTY / TEACHER MANAGEMENT
===================================================== */
router.post("/teachers", protect, authorize("admin"), createTeacher);
router.get("/teachers", protect, authorize("admin"), getTeachers);
router.put("/teachers/:teacherId", protect, authorize("admin"), updateTeacher);
router.delete("/teachers/:teacherId", protect, authorize("admin"), deleteTeacher);

/* =====================================================
   TIMETABLE MANAGEMENT
===================================================== */
router.post("/create-timetable", protect, authorize("admin"), createTimetable);
router.get(
  "/timetable/:classId",
  protect,
  authorize("student", "teacher", "admin"),
  getClassTimetable
);
router.get(
  "/teacher-timetable/:teacherId",
  protect,
  authorize("teacher", "admin"),
  getTeacherTimetable
);

/* =====================================================
   ANNOUNCEMENTS
===================================================== */
router.post("/announcements", protect, authorize("admin"), sendAnnouncement);
router.get("/announcements", protect, authorize("admin"), getAnnouncements);

/* PUBLIC ANNOUNCEMENTS - FOR STUDENTS & TEACHERS */
router.get("/announcements/public/all", protect, async (req, res) => {
  try {
    const Announcement = (await import("../models/Announcement.js")).default;
    
    // Get all announcements accessible to the current user
    const userRole = req.user?.role;
    
    const announcements = await Announcement.find({
      $or: [
        { target: "all" },
        { target: userRole }
      ]
    }).populate("sender", "name email").sort({ createdAt: -1 });
    
    res.json(announcements || []);
  } catch (err) {
    console.error("Public announcements error:", err.message);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

/* =====================================================
   FEE MANAGEMENT
===================================================== */
router.put("/fees/:feeId", protect, authorize("admin"), updateFeeStatus);

/* =====================================================
   AUDIT LOGS
===================================================== */
router.get("/audit-logs", protect, authorize("admin"), getAuditLogs);

/* =====================================================
   RESULTS
===================================================== */
router.post("/results", protect, authorize("admin", "teacher"), enterMarks);
router.get("/results", protect, authorize("admin", "teacher"), getResults);

/* =====================================================
   SETTINGS
===================================================== */
router.get("/settings", protect, authorize("admin"), getAdminSettings);
router.put("/settings", protect, authorize("admin"), updateAdminSettings);

export default router;

