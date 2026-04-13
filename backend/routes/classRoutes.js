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
   GET STUDENTS IN CLASS
====================================================== */

router.get(
"/students/:classId",
protect,
authorize("teacher","admin"),
async (req,res)=>{

try{

const cls = await Class.findById(req.params.classId)
.populate({
path:"students",
select:"name email roll faceDescriptor"
});

if(!cls){
return res.status(404).json({
message:"Class not found"
});
}

res.json({
students:cls.students
});

}catch(err){

res.status(500).json({
message:"Failed to fetch students"
});

}

}
);

export default router;