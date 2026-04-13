import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  target: { 
    type: String, 
    enum: ["all", "student", "teacher"], 
    default: "all" 
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Announcement", announcementSchema);