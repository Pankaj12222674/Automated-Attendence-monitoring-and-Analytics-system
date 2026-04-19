import Attendance from "../models/Attendance.js";
import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";

/* =======================================================
   HELPER FUNCTION → NORMALIZE DATE
======================================================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/* =======================================================
   STUDENT ATTENDANCE ANALYTICS
======================================================= */
export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ studentId })
      .populate("subjectId", "name")
      .sort({ date: 1 });

    if (records.length === 0) {
      return res.json({ monthly: [], subjects: [] });
    }

    const monthlyMap = {};
    records.forEach((record) => {
      if (record.isExcused) return;

      const date = new Date(record.date);
      const monthKey = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { total: 0, present: 0 };
      monthlyMap[monthKey].total++;
      if (record.status === "present" || record.status === "late") {
        monthlyMap[monthKey].present++;
      }
    });

    const monthly = Object.keys(monthlyMap).map((month) => ({
      month,
      percentage: Math.round(
        (monthlyMap[month].present / monthlyMap[month].total) * 100
      ),
    }));

    const subjectMap = {};
    records.forEach((record) => {
      if (record.isExcused) return;

      const subjectName = record.subjectId?.name || "Unknown";
      if (!subjectMap[subjectName]) subjectMap[subjectName] = { total: 0, present: 0 };
      subjectMap[subjectName].total++;
      if (record.status === "present" || record.status === "late") {
        subjectMap[subjectName].present++;
      }
    });

    const subjects = Object.keys(subjectMap).map((subject) => ({
      subject,
      percentage: Math.round(
        (subjectMap[subject].present / subjectMap[subject].total) * 100
      ),
    }));

    res.json({ monthly, subjects });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

/* =======================================================
   MARK ATTENDANCE FUNCTIONS
======================================================= */
export const markAttendance = async (req, res) => {
  try {
    const { classId, subjectId, records, method, sessionType } = req.body;

    if (!classId || !subjectId || !Array.isArray(records)) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }

    const today = normalizeDate(new Date());
    const currentSession = sessionType || "lecture";

    await Attendance.deleteMany({
      classId,
      subjectId,
      date: today,
      sessionType: currentSession,
    });

    const attendanceRecords = records.map((rec) => ({
      studentId: rec.studentId,
      subjectId,
      classId,
      teacherId: req.user._id,
      recordedBy: req.user._id,
      sessionType: currentSession,
      date: today,
      method: method || "manual",
      status: rec.status || "present",
      isExcused: rec.isExcused || false,
      notes: rec.notes || "",
    }));

    await Attendance.insertMany(attendanceRecords);

    res
      .status(201)
      .json({ message: `${currentSession.toUpperCase()} attendance marked successfully` });
  } catch (error) {
    console.error("MARK ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};

export const markFaceAttendance = async (req, res) => {
  try {
    const { studentId, classId, subjectId, sessionType } = req.body;

    if (!studentId || !classId || !subjectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const today = normalizeDate(new Date());
    const currentSession = sessionType || "lecture";

    const existing = await Attendance.findOne({
      studentId,
      subjectId,
      date: today,
      sessionType: currentSession,
    });

    if (existing) {
      return res.json({ message: "Attendance already marked for this session" });
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
      subjectId,
      teacherId: req.user._id,
      recordedBy: req.user._id,
      sessionType: currentSession,
      date: today,
      method: "face",
      status: "present",
    });

    res.status(201).json({
      message: "Face attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("FACE ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Error marking face attendance" });
  }
};

export const markQRAttendance = async (req, res) => {
  try {
    const { studentId, classId, subjectId, sessionType } = req.body;

    if (!studentId || !classId || !subjectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const today = normalizeDate(new Date());
    const currentSession = sessionType || "lecture";

    const existing = await Attendance.findOne({
      studentId,
      subjectId,
      date: today,
      sessionType: currentSession,
    });

    if (existing) {
      return res.json({ message: "Attendance already marked for this session" });
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
      subjectId,
      teacherId: req.user._id,
      recordedBy: req.user._id,
      sessionType: currentSession,
      date: today,
      method: "qr",
      status: "present",
    });

    res.status(201).json({
      message: "QR attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("QR ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Error marking QR attendance" });
  }
};

/* =======================================================
   GET FUNCTIONS
======================================================= */
export const getClassAttendance = async (req, res) => {
  try {
    const sessionType = req.query.sessionType || "lecture";
    const { classId, subjectId, date } = req.params;
    const normalizedDate = normalizeDate(date);

    const attendance = await Attendance.find({
      classId,
      subjectId,
      date: normalizedDate,
      sessionType,
    })
      .populate("studentId", "name email roll cgpa")
      .populate("subjectId", "name courseType")
      .populate("teacherId", "name designation")
      .populate("recordedBy", "name role");

    res.json(attendance);
  } catch (error) {
    console.error("GET CLASS ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch class attendance" });
  }
};

export const getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ studentId }).populate(
      "subjectId",
      "name credits"
    );

    const summary = {};
    records.forEach((rec) => {
      if (rec.isExcused) return;

      const subjectName = rec.subjectId?.name || "Unknown";
      if (!summary[subjectName]) summary[subjectName] = { present: 0, total: 0 };

      summary[subjectName].total++;
      if (rec.status === "present" || rec.status === "late") {
        summary[subjectName].present++;
      }
    });

    Object.keys(summary).forEach((sub) => {
      const data = summary[sub];
      data.percentage =
        data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
    });

    res.json(summary);
  } catch (error) {
    console.error("STUDENT SUMMARY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch student summary" });
  }
};

export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const history = await Attendance.find({ studentId })
      .sort({ date: -1, createdAt: -1 })
      .populate("subjectId", "name code courseType")
      .populate("classId", "name semester")
      .populate("teacherId", "name designation");

    res.json(history);
  } catch (error) {
    console.error("HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch attendance history" });
  }
};

/* =======================================================
   FIXED FUNCTION FOR CLASS STUDENTS PAGE
   ✅ IMPORTANT FIX HERE
======================================================= */
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await User.find({
      classId: classId,
      role: "student",
    })
      .select("name email roll programId currentSemester cgpa classId")
      .sort({ roll: 1, name: 1 });

    return res.json({ students });
  } catch (error) {
    console.error("GET CLASS STUDENTS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch class students" });
  }
};

export const getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;

    const records = await Attendance.find({ classId }).populate("studentId", "_id");

    const studentStats = {};

    records.forEach((record) => {
      if (record.isExcused) return;

      const studentId = record.studentId?._id?.toString();
      if (!studentId) return;

      if (!studentStats[studentId]) {
        studentStats[studentId] = { total: 0, present: 0 };
      }

      studentStats[studentId].total++;
      if (record.status === "present" || record.status === "late") {
        studentStats[studentId].present++;
      }
    });

    const analytics = {};
    Object.keys(studentStats).forEach((studentId) => {
      const data = studentStats[studentId];
      analytics[studentId] = {
        percentage:
          data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      };
    });

    res.json(analytics);
  } catch (error) {
    console.error("CLASS ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch class analytics" });
  }
};

/* =======================================================
   TEACHER ATTENDANCE HISTORY
======================================================= */
export const getTeacherAttendanceHistory = async (req, res) => {
  try {
    const { classId, subjectId, sessionType } = req.query;

    if (!classId || !subjectId) {
      return res
        .status(400)
        .json({ message: "classId and subjectId are required" });
    }

    const filter = { classId, subjectId };
    if (sessionType) {
      filter.sessionType = sessionType;
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate("studentId", "name email roll")
      .populate("subjectId", "name code courseType")
      .populate("classId", "name semester")
      .populate("teacherId", "name designation")
      .populate("recordedBy", "name role");

    const sessionMap = new Map();

    records.forEach((rec) => {
      const recordDate = rec.date ? new Date(rec.date) : new Date(rec.createdAt);
      const normalized = new Date(
        recordDate.getFullYear(),
        recordDate.getMonth(),
        recordDate.getDate()
      );

      const sessionKey = `${normalized.toISOString()}_${rec.sessionType || "lecture"}`;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          _id: sessionKey,
          date: normalized,
          sessionType: rec.sessionType || "lecture",
          method: rec.method || "manual",
          subjectId: rec.subjectId,
          classId: rec.classId,
          teacherId: rec.teacherId,
          recordedBy: rec.recordedBy,
          createdAt: rec.createdAt,
          updatedAt: rec.updatedAt,
          students: [],
        });
      }

      const session = sessionMap.get(sessionKey);

      session.students.push({
        _id: rec._id,
        studentId: rec.studentId,
        status: rec.status,
        method: rec.method,
        isExcused: rec.isExcused || false,
        notes: rec.notes || "",
        markedAt: rec.createdAt,
        updatedAt: rec.updatedAt,
      });

      if (
        rec.updatedAt &&
        (!session.updatedAt || new Date(rec.updatedAt) > new Date(session.updatedAt))
      ) {
        session.updatedAt = rec.updatedAt;
      }
    });

    const history = Array.from(sessionMap.values()).sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    res.json({ history });
  } catch (error) {
    console.error("TEACHER ATTENDANCE HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch teacher attendance history" });
  }
};

// @desc    Advanced Analytics: Predict attendance needs & shortage
// @route   GET /api/attendance/analytics/advanced
// @access  Private (Admin/Teacher/Student)
export const getAdvancedAnalytics = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user._id;

    // We already imported Attendance and Subject at the top of the file
    const records = await Attendance.find({ studentId: studentId, isExcused: { $ne: true } })
      .populate("subjectId", "name code")
      .lean();

    const subjectStats = {};

    records.forEach((record) => {
      const subjId = record.subjectId?._id?.toString();
      if (!subjId) return;

      if (!subjectStats[subjId]) {
        subjectStats[subjId] = {
          subjectName: record.subjectId.name,
          subjectCode: record.subjectId.code,
          total: 0,
          present: 0,
        };
      }

      subjectStats[subjId].total += 1;
      if (record.status === "present" || record.status === "late") {
        subjectStats[subjId].present += 1;
      }
    });

    const threshold = 75; // 75% requirement
    const advancedStats = Object.values(subjectStats).map((stat) => {
      const percentage = stat.total > 0 ? (stat.present / stat.total) * 100 : 0;
      
      // Calculate how many more classes needed to reach 75%
      // Equation: (present + X) / (total + X) = 0.75 => X = 3 * total - 4 * present
      const neededClasses = (3 * stat.total) - (4 * stat.present);
      const classesToReachThreshold = neededClasses > 0 ? neededClasses : 0;

      // If they are above 75%, how many can they miss and stay above 75%?
      // Equation: present / (total + Y) = 0.75 => Y = (present / 0.75) - total
      const missableClasses = percentage > 75 
        ? Math.floor((stat.present / 0.75) - stat.total) 
        : 0;

      return {
        ...stat,
        percentage: Math.round(percentage * 100) / 100,
        isBelowThreshold: percentage < threshold,
        classesToReachThreshold,
        missableClasses,
        statusLabel: percentage < threshold 
          ? `Critical: Attend next ${classesToReachThreshold} classes` 
          : `Safe: Can miss ${missableClasses} classes`
      };
    });

    // Also get overall stats
    const totalClasses = advancedStats.reduce((sum, s) => sum + s.total, 0);
    const totalPresent = advancedStats.reduce((sum, s) => sum + s.present, 0);
    const overallPercentage = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        subjectWise: advancedStats
      }
    });
  } catch (error) {
    console.error("ADVANCED ANALYTICS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

