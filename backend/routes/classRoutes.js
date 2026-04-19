import express from "express";

import {
createClass,
addStudentToClass,
createSubject,
getSubjectsByClass,
getSubjectsByTeacher,
assignTeacherToClass,
getClassesForTeacher
} from "../controllers/classController.js";

import { protect, authorize } from "../middleware/auth.js";

import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

const router = express.Router();



/* ======================================================
   ADMIN ROUTES
====================================================== */

router.post(
"/create-class",
protect,
authorize("admin"),
createClass
);

router.put(
"/assign-teacher",
protect,
authorize("admin"),
assignTeacherToClass
);

router.post(
"/add-student",
protect,
authorize("admin"),
addStudentToClass
);

router.post(
"/create-subject",
protect,
authorize("admin"),
createSubject
);



/* ======================================================
   ADMIN DASHBOARD DATA
====================================================== */

router.get(
"/admin/all",
protect,
authorize("admin"),
async (req,res)=>{

try{

/* CLASSES */

const classes = await Class.find()
.populate("teacherId","name email")
.populate("students","name email roll");


/* SUBJECTS */

const subjects = await Subject.find()
.populate("classId","name")
.populate("teacherId","name email");


/* TEACHERS */

const teachers = await User.find({
role:"teacher",
isApproved:true
}).select("name email");


res.json({
classes,
subjects,
teachers
});

}catch(err){

console.error("ADMIN DASHBOARD ERROR:",err);

res.status(500).json({
message:"Failed to load admin dashboard"
});

}

}
);



/* ======================================================
   STUDENT ROUTES
====================================================== */

router.get(
"/subjects/:classId",
protect,
authorize("student","teacher","admin"),
getSubjectsByClass
);



/* ======================================================
   TEACHER ROUTES
====================================================== */

router.get(
"/teacher/:teacherId",
protect,
authorize("teacher"),
getClassesForTeacher
);

/* ======================================================
   GET STUDENT TIMETABLE (by class)
====================================================== */
router.get(
  "/student-timetable/:classId",
  protect,
  authorize("student", "teacher", "admin"),
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Import Timetable model
      const Timetable = (await import("../models/Timetable.js")).default;

      const timetable = await Timetable.find({ classId })
        .populate("subjectId", "name code")
        .populate("teacherId", "name email")
        .sort({ day: 1, startTime: 1 })
        .lean();

      res.json(timetable || []);
    } catch (err) {
      console.error("Student timetable error:", err.message);
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  }
);



/* ======================================================
   GET STUDENTS IN CLASS
====================================================== */

router.get(
  "/students/:classId",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Method 1: Get students from Class.students array (assigned by admin)
      const cls = await Class.findById(classId)
        .populate({
          path: "students",
          select: "name email roll faceDescriptor"
        });

      if (!cls) {
        return res.status(404).json({
          message: "Class not found"
        });
      }

      // Method 2: Also get students who registered with this classId (newly created)
      const User = (await import("../models/User.js")).default;
      const newStudents = await User.find({
        classId: classId,
        role: "student"
      }).select("_id name email roll faceDescriptor").lean();

      // Combine both lists, removing duplicates
      const studentIds = new Set();
      const allStudents = [];

      // Add students from Class.students array first
      if (cls.students && Array.isArray(cls.students)) {
        cls.students.forEach((student) => {
          if (student && student._id) {
            studentIds.add(student._id.toString());
            allStudents.push(student);
          }
        });
      }

      // Add newly registered students (not in the array yet)
      newStudents.forEach((student) => {
        const studentIdStr = student._id.toString();
        if (!studentIds.has(studentIdStr)) {
          allStudents.push(student);
        }
      });

      console.log(`✅ Retrieved ${allStudents.length} students for class ${classId}`);
      console.log(`   - From Class.students: ${cls.students?.length || 0}`);
      console.log(`   - From User records: ${newStudents.length}`);

      res.json({
        students: allStudents
      });

    } catch (err) {
      console.error("GET STUDENTS ERROR:", err.message);
      res.status(500).json({
        message: "Failed to fetch students"
      });
    }
  }
);

export default router;