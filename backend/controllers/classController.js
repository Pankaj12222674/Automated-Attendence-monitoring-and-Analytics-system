import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

/* =======================================
            CREATE CLASS (Cohort)
======================================= */
export const createClass = async (req, res) => {
  try {
    // Upgraded to accept university parameters
    const { name, teacherId, departmentId, programId, semester, academicYear, capacity } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Class/Cohort name required" });
    }

    const existing = await Class.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Class/Cohort already exists" });
    }

    let teacher = null;
    if (teacherId) {
      teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(404).json({ message: "Teacher/Advisor not found" });
      }
    }

    const newClass = await Class.create({
      name,
      teacherId: teacherId || null,
      departmentId: departmentId || null,
      programId: programId || null,
      semester: semester || 1,
      academicYear: academicYear || "2024-2025",
      capacity: capacity || 60,
      students: [],
      subjects: []
    });

    res.status(201).json({
      message: "Cohort created successfully",
      class: newClass
    });
  } catch (err) {
    console.error("CREATE CLASS ERROR:", err);
    res.status(500).json({ message: "Error creating class" });
  }
};

/* =======================================
        ADD STUDENT TO CLASS (Enrollment)
======================================= */
export const addStudentToClass = async (req, res) => {
  try {
    const { name, email, classId } = req.body;

    if (!name || !email || !classId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class/Cohort not found" });
    }

    // NEW: Enforce University Capacity Limits
    if (cls.students.length >= cls.capacity) {
      return res.status(400).json({ 
        message: `Cannot enroll. Cohort capacity of ${cls.capacity} has been reached.` 
      });
    }

    let student = await User.findOne({ email });

    /* EXISTING STUDENT */
    if (student) {
      if (student.role !== "student") {
        return res.status(400).json({ message: "User exists but is not a student" });
      }

      if (!cls.students.includes(student._id)) {
        cls.students.push(student._id);
      }

      // Sync academic data from the cohort
      student.classId = classId;
      if (cls.programId) student.programId = cls.programId;
      if (cls.departmentId) student.departmentId = cls.departmentId;
      if (cls.semester) student.currentSemester = cls.semester;

      await student.save();
      await cls.save();

      return res.json({
        message: "Student enrolled in cohort successfully",
        student
      });
    }

    /* CREATE NEW STUDENT */
    // Generate a University Registration/Roll Number (e.g., U2024-XXXX)
    const year = new Date().getFullYear();
    const roll = `U${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    student = await User.create({
      name,
      email,
      password: "password123", // Standardized temp password
      role: "student",
      roll,
      classId,
      programId: cls.programId || null,
      departmentId: cls.departmentId || null,
      currentSemester: cls.semester || 1
    });

    cls.students.push(student._id);
    await cls.save();

    res.status(201).json({
      message: "Student registered and enrolled successfully",
      student
    });
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    res.status(500).json({ message: "Error enrolling student" });
  }
};

/* =======================================
            CREATE SUBJECT (Course)
======================================= */
export const createSubject = async (req, res) => {
  try {
    // Upgraded to include credits and courseType
    const { name, classId, teacherId, code, shortName, credits, courseType } = req.body;

    if (!name || !classId || !teacherId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class/Cohort not found" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check by name OR course code within the same cohort
    const exists = await Subject.findOne({ 
      $or: [ { name, classId }, { code: code || "NO_CODE", classId } ]
    });

    if (exists) {
      return res.status(400).json({ message: "Subject or Course Code already exists in this cohort" });
    }

    const subject = await Subject.create({
      name,
      classId,
      teacherId,
      code: code || `CRS-${Math.floor(100 + Math.random() * 900)}`,
      shortName,
      credits: credits || 3,
      courseType: courseType || "core",
      departmentId: cls.departmentId || null // Inherit department from the cohort
    });

    /* ADD SUBJECT TO CLASS */
    if (!cls.subjects.includes(subject._id)) {
      cls.subjects.push(subject._id);
    }
    await cls.save();

    res.status(201).json({
      message: "Course registered successfully",
      subject
    });
  } catch (err) {
    console.error("CREATE SUBJECT ERROR:", err);
    res.status(500).json({ message: "Error registering course" });
  }
};

/* =======================================
        GET SUBJECTS BY CLASS
======================================= */
export const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const subjects = await Subject.find({ classId })
      .populate("teacherId", "name email designation") // Added designation
      .populate("classId", "name semester"); // Added semester

    res.json({ subjects });
  } catch (err) {
    console.error("GET SUBJECTS ERROR:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

/* =======================================
        GET SUBJECTS BY TEACHER
======================================= */
export const getSubjectsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const subjects = await Subject.find({ teacherId })
      .populate("classId", "name programId semester academicYear"); // Expanded context

    res.json({ subjects });
  } catch (err) {
    console.error("GET TEACHER SUBJECTS ERROR:", err);
    res.status(500).json({ message: "Error fetching instructor courses" });
  }
};

/* =======================================
        GET CLASSES FOR TEACHER
======================================= */
export const getClassesForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // These are cohorts where the teacher acts as the Academic Advisor
    const classes = await Class.find({ teacherId })
      .populate("students", "name email roll cgpa currentSemester") // Added university metrics
      .populate("programId", "name");

    const subjects = await Subject.find({ teacherId })
      .populate("classId", "name semester");

    res.json({
      classes,
      subjects
    });
  } catch (err) {
    console.error("TEACHER CLASS ERROR:", err);
    res.status(500).json({ message: "Error loading faculty cohort data" });
  }
};

/* =======================================
        ASSIGN TEACHER TO CLASS (Advisor)
======================================= */
export const assignTeacherToClass = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;

    if (!classId || !teacherId) {
      return res.status(400).json({ message: "Cohort and Faculty ID required" });
    }

    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    classObj.teacherId = teacherId;
    await classObj.save();

    res.json({
      message: "Academic Advisor assigned successfully",
      class: classObj
    });
  } catch (err) {
    console.error("ASSIGN TEACHER ERROR:", err);
    res.status(500).json({ message: "Failed to assign advisor" });
  }
};