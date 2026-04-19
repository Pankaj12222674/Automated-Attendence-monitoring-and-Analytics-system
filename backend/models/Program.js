import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    // Links this degree back to its parent department
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    // e.g., "Bachelors", "Masters", "PhD", "Diploma"
    degreeType: {
      type: String,
      enum: ["Bachelors", "Masters", "PhD", "Diploma", "Certificate"],
      default: "Bachelors"
    },
    // Duration in Semesters (e.g., 8 semesters for a 4-year B.Tech)
    durationSemesters: {
      type: Number,
      default: 8
    },
    // Total credits required to graduate
    totalCreditsRequired: {
      type: Number,
      default: 120
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes
programSchema.index({ departmentId: 1 });
// programSchema.index({ name: 1 });

const Program = mongoose.model("Program", programSchema);

export default Program;