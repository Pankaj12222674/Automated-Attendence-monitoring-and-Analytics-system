import mongoose from "mongoose";

const qrSessionSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("QRSession", qrSessionSchema);
