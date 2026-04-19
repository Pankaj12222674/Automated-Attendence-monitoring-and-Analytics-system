import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    universityName: { type: String, default: "My University" },
    currentSession: { type: String, default: "2025-2026" },
    attendanceThreshold: { type: Number, default: 75 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
