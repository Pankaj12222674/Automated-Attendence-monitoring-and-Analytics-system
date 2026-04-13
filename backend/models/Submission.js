import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // The student's uploaded work
    fileUrl: {
      type: String,
      required: true 
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["submitted", "late", "graded"],
      default: "submitted"
    },
    // Grading data added by the Professor later
    marksObtained: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ""
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The Prof or TA who graded it
      default: null
    }
  },
  { timestamps: true }
);

// Ensure a student can only have one active submission per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// Auto-flag late submissions before saving
submissionSchema.pre("save", async function(next) {
  if (this.isNew) {
    const Assignment = mongoose.model("Assignment");
    const assignment = await Assignment.findById(this.assignmentId);
    
    if (assignment && this.submittedAt > assignment.dueDate) {
      this.status = "late";
    }
  }
  next();
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;