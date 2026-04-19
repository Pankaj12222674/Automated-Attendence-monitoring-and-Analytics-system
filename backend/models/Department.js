import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    // The Head of Department (HOD) or Dean
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Useful for quick UI color-coding
    colorCode: {
      type: String,
      default: "#4f46e5"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for fast lookups
// departmentSchema.index({ name: 1 });

const Department = mongoose.model("Department", departmentSchema);

export default Department;