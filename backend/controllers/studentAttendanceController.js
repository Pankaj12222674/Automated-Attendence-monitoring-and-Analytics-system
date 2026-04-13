import express from "express";
import { 
  getStudentSummary, 
  getStudentDetails 
} from "../controllers/studentAttendanceController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

/* ===========================
    GET SUMMARY FOR A STUDENT
=========================== */
router.get(
  "/summary/:studentId",
  protect,
  authorize("student", "admin"),
  getStudentSummary
);

/* =======================================
    GET DAY-WISE DETAILS FOR A SUBJECT
======================================= */
router.get(
  "/details/:studentId/:subject",
  protect,
  authorize("student", "admin"),
  getStudentDetails
);

export default router;
