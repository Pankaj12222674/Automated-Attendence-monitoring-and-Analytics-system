import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    /* =========================
          CORE LINKS
    ========================= */
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // The Cohort/Batch
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject", // The Course
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The primary professor of the course
      required: true
    },

    /* =========================
          UNIVERSITY SPECIFICS
    ========================= */
    sessionType: {
      type: String,
      enum: ["lecture", "lab", "tutorial", "seminar", "exam"],
      default: "lecture"
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Captures WHO actually took the attendance (e.g., a TA or proxy)
      default: null
    },
    isExcused: {
      type: Boolean,
      default: false // True for medical leaves, sports representation, etc.
    },

    /* =========================
          DATE & TIME
    ========================= */
    date: {
      type: Date,
      required: true
    },

    /* =========================
          STATUS - FIXED ENUM
    ========================= */
    status: {
      type: String,
      enum: ["present", "absent", "late"],   // ← Preserved exactly as requested
      default: "present",
      required: true
    },

    /* =========================
          METHOD - FIXED ENUM
    ========================= */
    method: {
      type: String,
      enum: ["manual", "qr", "face"],       // ← Preserved exactly as requested
      default: "manual",
      required: true
    },

    /* =========================
          SECURITY & TRACKING
    ========================= */
    sessionId: {
      type: String,
      default: null
    },
    qrToken: {
      type: String,
      default: null
    },
    qrExpiresAt: {
      type: Date,
      default: null
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    notes: {
      type: String, // e.g., "Arrived 20 mins late", "Medical note provided"
      default: ""
    }
  },
  { timestamps: true }
);

/* =========================
   PREVENT DUPLICATE ENTRY (Multi-Lecture Support)
========================= */
// Upgraded: Included sessionType so a student can be marked present 
// for a "lecture" AND a "lab" for the same subject on the same day.
attendanceSchema.index(
  { studentId: 1, subjectId: 1, date: 1, sessionType: 1 },
  { unique: true }
);

/* =========================
     PERFORMANCE INDEXES
========================= */
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ subjectId: 1, date: 1 });
attendanceSchema.index({ teacherId: 1 });
attendanceSchema.index({ studentId: 1 });

/* =========================
   NORMALIZE DATE BEFORE SAVE
========================= */
attendanceSchema.pre("save", function (next) {
  if (this.date) {
    this.date = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      this.date.getDate()
    );
  }
  
  // If recordedBy isn't provided (e.g., automated QR/Face), default to the teacher
  if (!this.recordedBy) {
    this.recordedBy = this.teacherId;
  }
  
  next();
});

/* =========================
     AUTO POPULATE
========================= */
attendanceSchema.pre(/^find/, function (next) {
  this.populate("studentId", "name email roll programId")
      .populate("subjectId", "name code credits") // Pulled in new university fields
      .populate("classId", "name semester")
      .populate("teacherId", "name designation");
  next();
});

/* =========================
     STATIC METHODS
========================= */
attendanceSchema.statics.getStudentAttendance = function (studentId) {
  return this.find({ studentId }).sort({ date: -1 });
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;