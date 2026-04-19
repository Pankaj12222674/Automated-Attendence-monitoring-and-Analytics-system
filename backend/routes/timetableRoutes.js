import express from "express";
const router = express.Router();
import {
  getTimetable,
  createTimetableEntry,
  generateAutoTimetable,
  deleteTimetableEntry,
} from "../controllers/timetableController.js";
import { protect, authorize } from "../middleware/auth.js";

// Require authentication for all timetable routes
router.use(protect);

router
  .route("/")
  .get(getTimetable)
  .post(authorize("admin"), createTimetableEntry);

router.post("/generate", authorize("admin"), generateAutoTimetable);

router.route("/:id").delete(authorize("admin"), deleteTimetableEntry);

export default router;
