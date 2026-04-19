import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    marksObtained: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 100 },
    grade: { type: String, default: "F" },
    gradePoint: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
