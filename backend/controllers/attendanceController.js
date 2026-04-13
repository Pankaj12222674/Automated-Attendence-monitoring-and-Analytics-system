import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";

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
    records.forEach(record => {
      // Skip excused absences from penalty math
      if (record.isExcused) return; 

      const date = new Date(record.date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { total: 0, present: 0 };
      monthlyMap[monthKey].total++;
      if (record.status === "present" || record.status === "late") monthlyMap[monthKey].present++;
    });

    const monthly = Object.keys(monthlyMap).map(month => ({
      month,
      percentage: Math.round((monthlyMap[month].present / monthlyMap[month].total) * 100)
    }));

    const subjectMap = {};
    records.forEach(record => {
      if (record.isExcused) return;

      const subjectName = record.subjectId?.name || "Unknown";
      if (!subjectMap[subjectName]) subjectMap[subjectName] = { total: 0, present: 0 };
      subjectMap[subjectName].total++;
      if (record.status === "present" || record.status === "late") subjectMap[subjectName].present++;
    });

    const subjects = Object.keys(subjectMap).map(subject => ({
      subject,
      percentage: Math.round((subjectMap[subject].present / subjectMap[subject].total) * 100)
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
    // Upgraded to accept sessionType (e.g., lecture, lab)
    const { classId, subjectId, records, method, sessionType } = req.body;

    if (!classId || !subjectId || !Array.isArray(records)) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }

    const today = normalizeDate(new Date());
    const currentSession = sessionType || "lecture";

    // UNIVERSITY FIX: Only delete records for this specific sessionType (Lecture vs Lab)
    // so we don't accidentally wipe out morning attendance when marking afternoon labs!
    await Attendance.deleteMany({ 
      classId, 
      subjectId, 
      date: today,
      sessionType: currentSession 
    });

    const attendanceRecords = records.map((rec) => ({
      studentId: rec.studentId,
      subjectId,
      classId,
      teacherId: req.user._id, // The Primary Professor
      recordedBy: req.user._id, // Who actually clicked save (could be a TA)
      sessionType: currentSession,
      date: today,
      method: method || "manual",
      status: rec.status || "present",
      isExcused: rec.isExcused || false, // Support for medical leaves
      notes: rec.notes || ""
    }));

    await Attendance.insertMany(attendanceRecords);

    res.status(201).json({ message: `${currentSession.toUpperCase()} attendance marked successfully` });
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

    // Check specific to this session type
    const existing = await Attendance.findOne({ 
      studentId, subjectId, date: today, sessionType: currentSession 
    });
    
    if (existing) return res.json({ message: "Attendance already marked for this session" });

    const attendance = await Attendance.create({
      studentId, classId, subjectId,
      teacherId: req.user._id,
      recordedBy: req.user._id,
      sessionType: currentSession,
      date: today,
      method: "face",
      status: "present"
    });

    res.status(201).json({ message: "Face attendance marked successfully", attendance });
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
      studentId, subjectId, date: today, sessionType: currentSession 
    });
    
    if (existing) return res.json({ message: "Attendance already marked for this session" });

    const attendance = await Attendance.create({
      studentId, classId, subjectId,
      teacherId: req.user._id,
      recordedBy: req.user._id,
      sessionType: currentSession,
      date: today,
      method: "qr",
      status: "present"
    });

    res.status(201).json({ message: "QR attendance marked successfully", attendance });
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
    // Check if frontend passed sessionType in query params, else default to lecture
    const sessionType = req.query.sessionType || "lecture";
    const { classId, subjectId, date } = req.params;
    const normalizedDate = normalizeDate(date);

    const attendance = await Attendance.find({
      classId, subjectId, date: normalizedDate, sessionType
    })
    .populate("studentId", "name email roll cgpa")
    .populate("subjectId", "name courseType")
    .populate("teacherId", "name designation")
    .populate("recordedBy", "name role"); // Show if a TA marked it

    res.json(attendance);
  } catch (error) {
    console.error("GET CLASS ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch class attendance" });
  }
};

export const getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ studentId }).populate("subjectId", "name credits");

    const summary = {};
    records.forEach((rec) => {
      // Skip excused absences so they don't lower the student's percentage
      if (rec.isExcused) return;

      const subjectName = rec.subjectId?.name || "Unknown";
      if (!summary[subjectName]) summary[subjectName] = { present: 0, total: 0 };
      
      summary[subjectName].total++;
      if (rec.status === "present" || rec.status === "late") {
        summary[subjectName].present++;
      }
    });

    Object.keys(summary).forEach(sub => {
      const data = summary[sub];
      data.percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
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
   NEW FUNCTIONS FOR CLASS STUDENTS PAGE
======================================================= */
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate("students", "name email roll programId currentSemester cgpa");

    if (!classData) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    res.json({ students: classData.students || [] });
  } catch (error) {
    console.error("GET CLASS STUDENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch class students" });
  }
};

export const getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;

    const records = await Attendance.find({ classId }).populate("studentId", "_id");

    const studentStats = {};

    records.forEach(record => {
      if (record.isExcused) return; // Excused leaves do not count against the student

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
    Object.keys(studentStats).forEach(studentId => {
      const data = studentStats[studentId];
      analytics[studentId] = {
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
      };
    });

    res.json(analytics);
  } catch (error) {
    console.error("CLASS ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch class analytics" });
  }
};

/* =======================================================
   TEACHER ATTENDANCE HISTORY (CLASS + SUBJECT)
======================================================= */
export const getTeacherAttendanceHistory = async (req, res) => {
  try {
    const { classId, subjectId, sessionType } = req.query;

    if (!classId || !subjectId) {
      return res.status(400).json({ message: "classId and subjectId are required" });
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

    // Group flat attendance records into session blocks
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

      // Keep latest update for session metadata
      if (rec.updatedAt && (!session.updatedAt || new Date(rec.updatedAt) > new Date(session.updatedAt))) {
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