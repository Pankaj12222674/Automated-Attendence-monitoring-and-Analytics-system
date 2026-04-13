import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    // Links to the specific Course
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    // Links to the Cohort taking the course
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    // The Professor who created it
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    // Optional: Array of URLs for attached PDFs, rubrics, or datasets
    attachments: [
      {
        fileName: String,
        fileUrl: String
      }
    ],
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published"
    }
  },
  { timestamps: true }
);

// Indexes for fast dashboard queries
assignmentSchema.index({ classId: 1, dueDate: 1 });
assignmentSchema.index({ subjectId: 1 });
assignmentSchema.index({ teacherId: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;