import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
{
  /* ===============================
        COURSE BASIC INFO
  =============================== */
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true, // Made required for University (e.g., "CS101")
    trim: true
  },
  shortName: {
    type: String,
    default: "",
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  semester: {
    type: Number, // Changed to Number for University Semesters (1-8)
    default: 1
  },

  /* ===============================
        UNIVERSITY ACADEMICS
  =============================== */
  credits: {
    type: Number,
    default: 3, // Standard 3-credit course
    min: 0,
    max: 6
  },
  courseType: {
    type: String,
    enum: ["core", "elective", "lab", "seminar", "project"],
    default: "core"
  },
  prerequisites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject" // Must pass these courses before taking this one
    }
  ],
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
  },
  syllabusUrl: {
    type: String, // Link to course materials/syllabus PDF
    default: ""
  },

  /* ===============================
        GRADING SYSTEM
  =============================== */
  totalMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 40
  },

  /* ===============================
        COHORT & FACULTY LINKS
  =============================== */
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // The specific cohort/section taking this course
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // The primary professor/instructor
    required: true
  },

  /* ===============================
        UI SETTINGS
  =============================== */
  color: {
    type: String,
    default: "#6366f1"
  },

  /* ===============================
        STATUS
  =============================== */
  isActive: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }
);


/* ===============================
      PREVENT DUPLICATE SUBJECT
=============================== */
subjectSchema.index(
  { name: 1, classId: 1 },
  { unique: true }
);
// Added index to ensure no duplicate course codes in the same cohort
subjectSchema.index(
  { code: 1, classId: 1 },
  { unique: true }
);

/* ===============================
      PERFORMANCE INDEXES
=============================== */
subjectSchema.index({ classId: 1 });
subjectSchema.index({ teacherId: 1 });
subjectSchema.index({ teacherId: 1, classId: 1 });
subjectSchema.index({ departmentId: 1 }); // New index


/* ===============================
      AUTO ADD SUBJECT TO CLASS
=============================== */
subjectSchema.post("save", async function(doc){
  try{
    const Class = mongoose.model("Class");
    await Class.findByIdAndUpdate(
      doc.classId,
      { $addToSet: { subjects: doc._id } }
    );
  } catch(err){
    console.error("Subject-Class Link Error:", err);
  }
});


/* ===============================
      AUTO REMOVE SUBJECT FROM CLASS
=============================== */
subjectSchema.post("findOneAndDelete", async function(doc){
  try{
    if(!doc) return;
    const Class = mongoose.model("Class");
    await Class.findByIdAndUpdate(
      doc.classId,
      { $pull: { subjects: doc._id } }
    );
  } catch(err){
    console.error("Subject Removal Error:", err);
  }
});


/* ===============================
      STATIC METHODS
=============================== */
subjectSchema.statics.getTeacherSubjects = function(teacherId){
  return this.find({ teacherId, isActive: true })
    .populate("classId", "name")
    .sort({ createdAt: -1 });
};

subjectSchema.statics.getClassSubjects = function(classId){
  return this.find({ classId, isActive: true })
    .populate("teacherId", "name email profileImage designation") // Added designation
    .sort({ createdAt: -1 });
};


const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;