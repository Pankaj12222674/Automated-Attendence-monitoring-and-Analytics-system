import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    credits: { 
      type: Number, 
      required: true,
      default: 3
    },
    programId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Program", 
      required: true 
    },
    semester: { 
      type: Number, 
      required: true 
    },
    isElective: { 
      type: Boolean, 
      default: false 
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

courseSchema.index({ programId: 1, semester: 1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;