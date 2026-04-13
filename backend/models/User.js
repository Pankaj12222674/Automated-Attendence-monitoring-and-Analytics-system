import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
{
  /* ===============================
        BASIC USER INFORMATION
  =============================== */
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student"
  },

  /* ===============================
        ADMIN APPROVAL & STATUS
  =============================== */
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["active", "inactive", "graduated", "suspended"], // Expanded for University
    default: "active"
  },

  /* ===============================
        UNIVERSITY STUDENT SPECIFICS
  =============================== */
  roll: {
    type: String, // University Registration/Enrollment Number
    default: null,
    trim: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program", // e.g., B.Tech Computer Science, M.Sc Physics
    default: null
  },
  currentSemester: {
    type: Number,
    default: 1
  },
  section: {
    type: String,
    default: "A"
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // Legacy support (Acts as specific cohort/batch e.g., CS-2024-A)
    default: null
  },
  cgpa: {
    type: Number,
    default: 0.0
  },
  creditsEarned: {
    type: Number,
    default: 0
  },
  academicAdvisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to a Faculty Member
    default: null
  },

  /* ===============================
        UNIVERSITY FACULTY SPECIFICS
  =============================== */
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department", // e.g., School of Engineering
    default: null
  },
  designation: {
    type: String,
    default: "Faculty Member" // e.g., "Professor", "Assistant Professor", "Dean"
  },
  isHOD: {
    type: Boolean,
    default: false
  },
  officeHours: [
    {
      day: String,
      time: String,
      location: String
    }
  ],

  /* ===============================
        ATTENDANCE QUICK STATS
        (for fast dashboard loading)
  =============================== */
  attendanceStats: {
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    }
  },

  /* ===============================
        PROFILE IMAGE
  =============================== */
  profileImage: {
    type: String,
    default: ""
  },

  /* ===============================
        FACE RECOGNITION
  =============================== */
  faceDescriptor: {
    type: [Number],
    default: [],
    validate: {
      validator: function(arr){
        return arr.length === 0 || arr.length === 128
      },
      message: "Face descriptor must be exactly 128 values"
    }
  },

  /* ===============================
        NOTIFICATIONS SYSTEM
  =============================== */
  notifications: [
    {
      message: String,
      type: {
        type: String,
        enum: ["info", "warning", "success", "academic", "finance"], // Expanded types
        default: "info"
      },
      read: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  /* ===============================
        PASSWORD RESET SYSTEM
  =============================== */
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);

/* =====================================
        HASH PASSWORD BEFORE SAVE
===================================== */
userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* =====================================
        PASSWORD MATCH FUNCTION
===================================== */
userSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
};

/* =====================================
        GENERATE RESET PASSWORD TOKEN
===================================== */
userSchema.methods.getResetPasswordToken = function(){
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

/* =====================================
        INDEXES (OPTIMIZATION)
===================================== */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ classId: 1 });
userSchema.index({ programId: 1 }); // New Index for quick program lookups
userSchema.index({ departmentId: 1 }); // New Index for quick faculty lookups

const User = mongoose.model("User", userSchema);

export default User;