import User from "../models/User.js";
import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import Attendance from "../models/Attendance.js";
import Department from "../models/Department.js";
import Program from "../models/Program.js";

// --------------------------------------------------
// Optional model loaders (safe fallback if file missing)
// --------------------------------------------------
let AnnouncementModelCache = undefined;
let FeeModelCache = undefined;

const memoryAnnouncements = [];
const memoryAuditLogs = [];
let memorySettings = {
  universityName: "My University",
  currentSession: "2025-2026",
  attendanceThreshold: 75,
  currency: "INR",
};

const loadAnnouncementModel = async () => {
  if (AnnouncementModelCache !== undefined) return AnnouncementModelCache;

  try {
    const mod = await import("../models/Announcement.js");
    AnnouncementModelCache = mod.default;
    return AnnouncementModelCache;
  } catch (err) {
    try {
      const mod = await import("../models/Announcements.js");
      AnnouncementModelCache = mod.default;
      return AnnouncementModelCache;
    } catch (e) {
      AnnouncementModelCache = null;
      return null;
    }
  }
};

const loadFeeModel = async () => {
  if (FeeModelCache !== undefined) return FeeModelCache;

  try {
    const mod = await import("../models/Fee.js");
    FeeModelCache = mod.default;
    return FeeModelCache;
  } catch (err) {
    FeeModelCache = null;
    return null;
  }
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------
const addAuditLog = (action, actor = "System", meta = {}) => {
  memoryAuditLogs.unshift({
    _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    actor,
    meta,
    createdAt: new Date(),
  });

  if (memoryAuditLogs.length > 100) {
    memoryAuditLogs.length = 100;
  }
};

const getActorName = (req) => {
  return req?.user?.name || req?.user?.email || "Admin";
};

// ==================================================
// USER APPROVAL & MANAGEMENT
// ==================================================
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      isApproved: false,
      role: { $ne: "admin" },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error("GET PENDING USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, approved, search } = req.query;

    const query = {};

    if (role) query.role = role;
    if (approved === "true") query.isApproved = true;
    if (approved === "false") query.isApproved = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("programId", "name")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    addAuditLog(
      `Approved user: ${user.name || user.email}`,
      getActorName(req),
      { userId: user._id, role: user.role }
    );

    res.json({ message: "User approved successfully", user });
  } catch (err) {
    console.error("APPROVE USER ERROR:", err);
    res.status(500).json({ message: "Failed to approve user" });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    addAuditLog(
      `Rejected user: ${user.name || user.email}`,
      getActorName(req),
      { userId, role: user.role }
    );

    res.json({ message: "User rejected and deleted successfully" });
  } catch (err) {
    console.error("REJECT USER ERROR:", err);
    res.status(500).json({ message: "Failed to reject user" });
  }
};

// ==================================================
// DASHBOARD STATS
// ==================================================
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalDepartments,
      totalPrograms,
      pendingApprovals,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      Class.countDocuments(),
      Department.countDocuments().catch(() => 0),
      Program.countDocuments().catch(() => 0),
      User.countDocuments({ isApproved: false, role: { $ne: "admin" } }),
    ]);

    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const overallAttendance =
      attendanceStats.length > 0 && attendanceStats[0].total > 0
        ? Math.round((attendanceStats[0].present / attendanceStats[0].total) * 100)
        : 0;

    const Fee = await loadFeeModel();
    let collectedFees = 0;

    if (Fee) {
      const feeAgg = await Fee.aggregate([
        {
          $match: { status: "paid" },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]).catch(() => []);

      collectedFees = feeAgg?.[0]?.total || 0;
    }

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalDepartments,
      totalPrograms,
      pendingApprovals,
      collectedFees,
      overallAttendance,
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ==================================================
// FULL DASHBOARD DATA
// ==================================================
export const getFullAdminData = async (req, res) => {
  try {
    const Fee = await loadFeeModel();
    const Announcement = await loadAnnouncementModel();

    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("programId", "name")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    // Low attendance (student-wise)
    const attendanceAgg = await Attendance.aggregate([
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          attendance: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [{ $divide: ["$present", "$total"] }, 100],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $match: {
          attendance: { $lt: memorySettings.attendanceThreshold || 75 },
        },
      },
    ]);

    const lowAttendance = await Promise.all(
      attendanceAgg.map(async (entry) => {
        const student = await User.findById(entry._id).select("name email");
        return {
          _id: student?._id || entry._id,
          name: student?.name || "Unknown Student",
          email: student?.email || "",
          attendance: entry.attendance,
        };
      })
    );

    // Monthly attendance trend
    const trendAgg = await Attendance.aggregate([
      {
        $match: {
          createdAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]).catch(() => []);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const trend = trendAgg.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      value: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));

    // Fees
    let fees = [];

    if (Fee) {
      const feeDocs = await Fee.find()
        .populate("studentId", "name email roll")
        .populate("classId", "name")
        .sort({ createdAt: -1 })
        .catch(() => []);

      fees = feeDocs.map((fee) => ({
        ...fee.toObject(),
        studentName: fee.studentId?.name || "Student",
        studentEmail: fee.studentId?.email || "",
        studentRoll: fee.studentId?.roll || "",
        className: fee.classId?.name || "",
      }));
    }

    // Recent activity
    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentClasses = await Class.find()
      .select("name createdAt")
      .sort({ createdAt: -1 })
      .limit(3);

    const recentSubjects = await Subject.find()
      .select("name code createdAt")
      .sort({ createdAt: -1 })
      .limit(3);

    let recentAnnouncements = [];
    if (Announcement) {
      recentAnnouncements = await Announcement.find()
        .select("message target createdAt")
        .sort({ createdAt: -1 })
        .limit(3)
        .catch(() => []);
    } else {
      recentAnnouncements = memoryAnnouncements.slice(0, 3);
    }

    const activities = [
      ...recentUsers.map((u) => ({
        type: "user",
        message: `New ${u.role} registered: ${u.name || u.email}`,
        createdAt: u.createdAt,
      })),
      ...recentClasses.map((c) => ({
        type: "class",
        message: `Class created: ${c.name}`,
        createdAt: c.createdAt,
      })),
      ...recentSubjects.map((s) => ({
        type: "subject",
        message: `Subject created: ${s.name}${s.code ? ` (${s.code})` : ""}`,
        createdAt: s.createdAt,
      })),
      ...recentAnnouncements.map((a) => ({
        type: "announcement",
        message: `Announcement sent to ${a.target || "all"}`,
        createdAt: a.createdAt,
      })),
      ...memoryAuditLogs.slice(0, 5).map((log) => ({
        type: "audit",
        message: log.action,
        createdAt: log.createdAt,
      })),
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      students,
      lowAttendance,
      trend,
      fees,
      activities,
    });
  } catch (err) {
    console.error("GET FULL ADMIN DATA ERROR:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// ==================================================
// CLASS MANAGEMENT
// ==================================================
export const createClass = async (req, res) => {
  try {
    const {
      name,
      teacherId,
      departmentId,
      programId,
      semester,
      academicYear,
      capacity,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Cohort/Class name is required" });
    }

    const exists = await Class.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Cohort/Class already exists" });
    }

    const cls = await Class.create({
      name,
      teacherId: teacherId || null,
      departmentId: departmentId || null,
      programId: programId || null,
      semester: semester || 1,
      academicYear: academicYear || "2025-2026",
      capacity: capacity || 60,
    });

    addAuditLog(`Created class: ${cls.name}`, getActorName(req), {
      classId: cls._id,
    });

    res.status(201).json({ message: "Cohort created successfully", cls });
  } catch (err) {
    console.error("CREATE CLASS ERROR:", err);
    res.status(500).json({ message: "Failed to create cohort" });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacherId", "name email designation")
      .populate("programId", "name")
      .populate("students", "name email roll cgpa")
      .sort({ createdAt: -1 });

    res.json(classes);
  } catch (err) {
    console.error("GET CLASSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

export const assignStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (studentIds && studentIds.length > cls.capacity) {
      return res
        .status(400)
        .json({ message: `Cannot exceed cohort capacity of ${cls.capacity}` });
    }

    cls.students = studentIds || [];
    await cls.save();

    addAuditLog(
      `Assigned ${studentIds?.length || 0} students to class: ${cls.name}`,
      getActorName(req),
      { classId: cls._id }
    );

    res.json({ message: "Students assigned successfully", cls });
  } catch (err) {
    console.error("ASSIGN STUDENTS ERROR:", err);
    res.status(500).json({ message: "Failed to assign students" });
  }
};

// ==================================================
// SUBJECT MANAGEMENT
// ==================================================
export const createSubject = async (req, res) => {
  try {
    const { name, classId, teacherId, code, shortName, credits, courseType } =
      req.body;

    if (!name || !classId || !teacherId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Subject.findOne({
      $or: [{ name, classId }, { code, classId }],
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Subject/Course Code already exists in this cohort" });
    }

    const subject = await Subject.create({
      name,
      classId,
      teacherId,
      code: code || `CRS-${Math.floor(100 + Math.random() * 900)}`,
      shortName,
      credits: credits || 3,
      courseType: courseType || "core",
    });

    addAuditLog(`Created subject: ${subject.name}`, getActorName(req), {
      subjectId: subject._id,
      classId,
    });

    res.status(201).json({ message: "Course created successfully", subject });
  } catch (err) {
    console.error("CREATE SUBJECT ERROR:", err);
    res.status(500).json({ message: "Failed to create subject" });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacherId", "name email designation")
      .populate("classId", "name semester academicYear")
      .sort({ createdAt: -1 });

    res.json(subjects);
  } catch (err) {
    console.error("GET SUBJECTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

// ==================================================
// TIMETABLE MANAGEMENT
// ==================================================
export const createTimetable = async (req, res) => {
  try {
    const { day, time, subjectId, classId } = req.body;

    if (!day || !time || !subjectId || !classId) {
      return res.status(400).json({
        message: "Missing required fields: day, time, subjectId, or classId",
      });
    }

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const teacherId = subject.teacherId;

    if (!teacherId) {
      return res.status(400).json({
        message: "This subject does not have a teacher assigned to it yet.",
      });
    }

    const existing = await Timetable.findOne({ classId, day, time });
    if (existing) {
      return res.status(400).json({
        message: "A timetable entry already exists for this class on this day and time.",
      });
    }

    const newEntry = await Timetable.create({
      day,
      time,
      subjectId,
      classId,
      teacherId,
    });

    addAuditLog(`Created timetable entry: ${day} ${time}`, getActorName(req), {
      timetableId: newEntry._id,
      classId,
      subjectId,
      teacherId,
    });

    res.status(201).json({
      message: "Lecture scheduled successfully",
      newEntry,
    });
  } catch (err) {
    console.error("CREATE TIMETABLE ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;

    const timetable = await Timetable.find({ classId })
      .populate("subjectId", "name code")
      .populate("teacherId", "name")
      .sort({ day: 1, time: 1 });

    res.json(timetable);
  } catch (err) {
    console.error("GET CLASS TIMETABLE ERROR:", err);
    res.status(500).json({ message: "Failed to load timetable" });
  }
};

export const getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const timetable = await Timetable.find({ teacherId })
      .populate("classId", "name")
      .populate("subjectId", "name code")
      .sort({ day: 1, time: 1 });

    res.json(timetable);
  } catch (err) {
    console.error("GET TEACHER TIMETABLE ERROR:", err);
    res.status(500).json({ message: "Failed to load timetable" });
  }
};

// ==================================================
// ANNOUNCEMENTS
// ==================================================
export const sendAnnouncement = async (req, res) => {
  try {
    const { message, target } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Announcement message is required" });
    }

    const Announcement = await loadAnnouncementModel();

    let announcement;

    if (Announcement) {
      announcement = await Announcement.create({
        message: message.trim(),
        target: target || "all",
        createdBy: req?.user?._id || null,
      }).catch(async () => {
        return await Announcement.create({
          message: message.trim(),
          target: target || "all",
        });
      });
    } else {
      announcement = {
        _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: message.trim(),
        target: target || "all",
        createdAt: new Date(),
      };
      memoryAnnouncements.unshift(announcement);
    }

    addAuditLog(`Sent announcement to ${target || "all"}`, getActorName(req), {
      target: target || "all",
    });

    res.json({
      success: true,
      message: "Announcement broadcasted successfully",
      announcement,
    });
  } catch (err) {
    console.error("SEND ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Failed to send announcement" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const Announcement = await loadAnnouncementModel();

    let announcements = [];

    if (Announcement) {
      announcements = await Announcement.find()
        .sort({ createdAt: -1 })
        .catch(() => []);
    } else {
      announcements = memoryAnnouncements;
    }

    res.json({ announcements });
  } catch (err) {
    console.error("GET ANNOUNCEMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// ==================================================
// FACULTY / TEACHER MANAGEMENT
// ==================================================
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, departmentId, designation } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }

    const teacher = await User.create({
      name,
      email,
      password: password || "Teacher@123",
      role: "teacher",
      isApproved: true,
      departmentId: departmentId || null,
      designation: designation || "Faculty",
    });

    addAuditLog(`Created teacher: ${teacher.name}`, getActorName(req), {
      teacherId: teacher._id,
    });

    const cleanTeacher = await User.findById(teacher._id)
      .select("-password")
      .populate("departmentId", "name");

    res.status(201).json({
      message: "Teacher created successfully",
      teacher: cleanTeacher,
      tempPassword: password ? undefined : "Teacher@123",
    });
  } catch (err) {
    console.error("CREATE TEACHER ERROR:", err);
    res.status(500).json({ message: "Failed to create teacher" });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    res.json({ teachers });
  } catch (err) {
    console.error("GET TEACHERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, email, departmentId, designation, isApproved } = req.body;

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (name !== undefined) teacher.name = name;
    if (email !== undefined) teacher.email = email;
    if (departmentId !== undefined) teacher.departmentId = departmentId || null;
    if (designation !== undefined) teacher.designation = designation;
    if (isApproved !== undefined) teacher.isApproved = isApproved;

    await teacher.save();

    addAuditLog(`Updated teacher: ${teacher.name}`, getActorName(req), {
      teacherId: teacher._id,
    });

    const cleanTeacher = await User.findById(teacher._id)
      .select("-password")
      .populate("departmentId", "name");

    res.json({
      message: "Teacher updated successfully",
      teacher: cleanTeacher,
    });
  } catch (err) {
    console.error("UPDATE TEACHER ERROR:", err);
    res.status(500).json({ message: "Failed to update teacher" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" }).select("-password");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await User.findByIdAndDelete(teacherId);

    addAuditLog(`Deleted teacher: ${teacher.name}`, getActorName(req), {
      teacherId,
    });

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    console.error("DELETE TEACHER ERROR:", err);
    res.status(500).json({ message: "Failed to delete teacher" });
  }
};

// ==================================================
// FEE MANAGEMENT
// ==================================================
export const updateFeeStatus = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { status, amountPaid, paymentMethod, transactionId } = req.body;

    const Fee = await loadFeeModel();
    if (!Fee) {
      return res.status(500).json({ message: "Fee model not available" });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    if (typeof amountPaid === "number" && amountPaid >= 0) {
      fee.amountPaid = amountPaid;
    }

    if (status === "paid") {
      fee.amountPaid = fee.totalAmount;
    } else if (status === "pending") {
      fee.amountPaid = 0;
    } else if (status === "partial" && typeof amountPaid !== "number") {
      fee.amountPaid = Math.max(1, Math.floor(fee.totalAmount / 2));
    }

    if (typeof amountPaid === "number" && amountPaid > 0) {
      fee.paymentHistory.push({
        amount: amountPaid,
        method: paymentMethod || "Bank Transfer",
        transactionId: transactionId || "",
      });
    }

    await fee.save();

    addAuditLog(
      `Updated fee status for fee record ${fee._id}`,
      getActorName(req),
      {
        feeId: fee._id,
        status: fee.status,
        amountPaid: fee.amountPaid,
      }
    );

    res.json({
      message: "Fee updated successfully",
      fee,
    });
  } catch (err) {
    console.error("UPDATE FEE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update fee status" });
  }
};

// ==================================================
// AUDIT LOGS
// ==================================================
export const getAuditLogs = async (req, res) => {
  try {
    res.json({ logs: memoryAuditLogs });
  } catch (err) {
    console.error("GET AUDIT LOGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

// ==================================================
// SETTINGS
// ==================================================
export const getAdminSettings = async (req, res) => {
  try {
    res.json(memorySettings);
  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    memorySettings = {
      ...memorySettings,
      ...req.body,
    };

    addAuditLog("Updated admin settings", getActorName(req), req.body || {});

    res.json({
      message: "Settings updated successfully",
      settings: memorySettings,
    });
  } catch (err) {
    console.error("UPDATE SETTINGS ERROR:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

// ==================================================
// UNIVERSITY HELPERS (kept for compatibility)
// ==================================================
export const createDepartment = async (req, res) => {
  try {
    const { name, head } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const exists = await Department.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const dept = await Department.create({
      name: name.trim(),
      head: head || null,
    });

    addAuditLog(`Created department: ${dept.name}`, getActorName(req), {
      departmentId: dept._id,
    });

    res.status(201).json({ message: "Department created successfully", dept });
  } catch (err) {
    console.error("CREATE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: "Failed to create department" });
  }
};

export const createProgram = async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    if (!name || !name.trim() || !departmentId) {
      return res.status(400).json({
        message: "Program name and departmentId are required",
      });
    }

    const exists = await Program.findOne({
      name: name.trim(),
      departmentId,
    });

    if (exists) {
      return res.status(400).json({
        message: "Program already exists in this department",
      });
    }

    const prog = await Program.create({
      name: name.trim(),
      departmentId,
    });

    addAuditLog(`Created program: ${prog.name}`, getActorName(req), {
      programId: prog._id,
      departmentId,
    });

    res.status(201).json({ message: "Program created successfully", program: prog });
  } catch (err) {
    console.error("CREATE PROGRAM ERROR:", err);
    res.status(500).json({ message: "Failed to create program" });
  }
};