import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
{
  /* =========================
        COHORT / SECTION NAME
  ========================= */
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true // e.g., "B.Tech CS - Fall 2024 - Section A"
  },

  /* =========================
        UNIVERSITY STRUCTURE
  ========================= */
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program", // e.g., B.Tech, M.Sc
    default: null
  },
  semester: {
    type: Number,
    default: 1
  },
  academicYear: {
    type: String,
    default: "" // e.g., "2024-2025"
  },

  /* =========================
        FACULTY ADVISOR
  ========================= */
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Acts as the Cohort Advisor / Mentor
    default: null
  },

  /* =========================
        ENROLLMENT & CAPACITY
  ========================= */
  capacity: {
    type: Number,
    default: 60 // Max students allowed in this section
  },
  students: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    default: []
  },

  /* =========================
        REGISTERED COURSES
  ========================= */
  subjects: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ],
    default: []
  }

},
{ timestamps: true }
);

/* =========================
      PREVENT DUPLICATES
========================= */
classSchema.pre("save", function(next){
  
  if(this.students && this.students.length){
    this.students = [
      ...new Set(this.students.map(id => id.toString()))
    ].map(id => new mongoose.Types.ObjectId(id));
  }

  if(this.subjects && this.subjects.length){
    this.subjects = [
      ...new Set(this.subjects.map(id => id.toString()))
    ].map(id => new mongoose.Types.ObjectId(id));
  }

  next();
});

/* =========================
      DATABASE INDEXES
========================= */
classSchema.index({ name: 1 });
classSchema.index({ teacherId: 1 });
classSchema.index({ programId: 1, semester: 1 }); // New index for quick batch filtering

/* =========================
      VIRTUAL COUNTS
========================= */
classSchema.virtual("studentCount").get(function(){
  if(!this.students) return 0;
  return this.students.length;
});

classSchema.virtual("subjectCount").get(function(){
  if(!this.subjects) return 0;
  return this.subjects.length;
});

classSchema.virtual("seatsAvailable").get(function(){
  const enrolled = this.students ? this.students.length : 0;
  return Math.max(0, this.capacity - enrolled);
});

/* =========================
      ENABLE VIRTUALS
========================= */
classSchema.set("toJSON", { virtuals: true });
classSchema.set("toObject", { virtuals: true });

/* =========================
      MODEL EXPORT
========================= */
const Class = mongoose.model("Class", classSchema);

export default Class;