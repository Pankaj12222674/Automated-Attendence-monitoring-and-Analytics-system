import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

/* ================================================
   GET STUDENT SUMMARY (All subjects percentage)
================================================ */
export const getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const totalRecords = await Attendance.countDocuments({ studentId });
    if (totalRecords === 0) {
      return res.json({ totalPresent: 0, percentage: 0 });
    }

    const presentRecords = await Attendance.countDocuments({
      studentId,
      status: { $in: ["present", "late"] },
      isExcused: false,
    });

    const percentage = Math.round((presentRecords / totalRecords) * 100);

    res.json({ totalPresent: presentRecords, percentage });
  } catch (err) {
    console.error("STUDENT SUMMARY ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch student summary" });
  }
};

/* ================================================
   GET DAY-WISE DETAILS FOR A SUBJECT
================================================ */
export const getStudentDetails = async (req, res) => {
  try {
    const { studentId, subject } = req.params;

    const records = await Attendance.find({
      studentId,
    })
      .populate("subjectId", "name")
      .sort({ date: -1 })
      .lean();

    if (!records || records.length === 0) {
      return res.json([]);
    }

    res.json(records);
  } catch (err) {
    console.error("STUDENT DETAILS ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch student details" });
  }
};
