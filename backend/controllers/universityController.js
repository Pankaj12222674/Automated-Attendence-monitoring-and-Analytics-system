import mongoose from "mongoose";
import Department from "../models/Department.js";
import Program from "../models/Program.js";
import User from "../models/User.js";
import Fee from "../models/Fee.js";

// ==========================================
// 1. CREATE DEPARTMENT & PROGRAMS
// ==========================================

export const createDepartment = async (req, res) => {
  try {
    const { name, head } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const dept = await Department.create({
      name: name.trim(),
      head: head || null,
    });

    res.status(201).json({ message: "Department created", dept });
  } catch (err) {
    console.error("DEPT CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create department" });
  }
};

export const createProgram = async (req, res) => {
  try {
    const { name, departmentId, baseTuitionFee } = req.body;

    if (!name || !name.trim() || !departmentId) {
      return res.status(400).json({
        message: "Program name and departmentId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid Department ID" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const existing = await Program.findOne({
      name: name.trim(),
      departmentId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Program already exists in this department",
      });
    }

    const program = await Program.create({
      name: name.trim(),
      departmentId,
      baseTuitionFee: baseTuitionFee || 50000,
    });

    res.status(201).json({ message: "Program created", program });
  } catch (err) {
    console.error("PROGRAM CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create program" });
  }
};

export const getAllUniversityData = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("head", "name email designation")
      .sort({ createdAt: -1 });

    const programs = await Program.find()
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    res.json({ departments, programs });
  } catch (err) {
    console.error("FETCH UNI DATA ERROR:", err);
    res.status(500).json({ message: "Failed to fetch university structure" });
  }
};

// ==========================================
// 2. MASTER STUDENT ENROLLMENT PIPELINE
// ==========================================

export const enrollMasterStudent = async (req, res) => {
  console.log("PAYLOAD RECEIVED:", req.body);

  try {
    const { name, email, classId, programId } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !classId || !programId) {
      return res.status(400).json({
        message: "Name, email, classId, and programId are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(programId)) {
      return res.status(400).json({
        message: "Invalid Program ID. Please refresh and try again.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        message: "Invalid Class ID. Please refresh and try again.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Get the Program to find the Department and Tuition Fee
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Degree Program not found." });
    }

    // 2. Check if student already exists
    let existingUser = await User.findOne({ email: normalizedEmail });

    // ==========================================
    // CASE A: USER ALREADY EXISTS
    // ==========================================
    if (existingUser) {
      if (existingUser.role !== "student") {
        return res.status(400).json({
          message: "A non-student user already exists with this email.",
        });
      }

      // Update student profile
      existingUser.name = name.trim();
      existingUser.classId = classId;
      existingUser.programId = program._id;
      existingUser.departmentId = program.departmentId;
      existingUser.currentSemester = existingUser.currentSemester || 1;
      existingUser.isApproved = true;
      existingUser.status = "active";

      // Generate roll number if missing
      if (!existingUser.roll) {
        const currentYear = new Date().getFullYear();
        const deptCode = (program.name || "PR").substring(0, 2).toUpperCase();

        let generatedRegNo;
        let isUnique = false;

        while (!isUnique) {
          const randomDigits = Math.floor(1000 + Math.random() * 9000);
          generatedRegNo = `${currentYear}${deptCode}${randomDigits}`;
          const existingRoll = await User.findOne({ roll: generatedRegNo });
          if (!existingRoll) isUnique = true;
        }

        existingUser.roll = generatedRegNo;
      }

      await existingUser.save();

      // Create semester 1 fee only if no existing fee record
      let existingFee = await Fee.findOne({
        studentId: existingUser._id,
        semester: 1,
        feeType: "Tuition",
      });

      let createdFee = null;

      if (!existingFee) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        createdFee = await Fee.create({
          studentId: existingUser._id,
          classId,
          feeType: "Tuition",
          semester: 1,
          totalAmount: program.baseTuitionFee || 50000,
          dueDate,
          status: "pending",
        });
      }

      return res.status(200).json({
        message: "Existing student updated and enrolled successfully.",
        student: {
          _id: existingUser._id,
          name: existingUser.name,
          regNo: existingUser.roll,
          email: existingUser.email,
        },
        financials: {
          invoiceCreated: !!createdFee,
          amount: createdFee?.totalAmount || existingFee?.totalAmount || program.baseTuitionFee || 50000,
          dueDate: createdFee?.dueDate || existingFee?.dueDate || null,
        },
      });
    }

    // ==========================================
    // CASE B: CREATE BRAND NEW STUDENT
    // ==========================================

    const currentYear = new Date().getFullYear();
    const deptCode = (program.name || "PR").substring(0, 2).toUpperCase();

    let generatedRegNo;
    let isUnique = false;

    while (!isUnique) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      generatedRegNo = `${currentYear}${deptCode}${randomDigits}`;
      const existingRoll = await User.findOne({ roll: generatedRegNo });
      if (!existingRoll) isUnique = true;
    }

    // Default password for admin-created students
    const defaultPassword = "Welcome123";

    const newStudent = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: defaultPassword,
      role: "student",
      classId,
      programId: program._id,
      departmentId: program.departmentId,
      roll: generatedRegNo,
      currentSemester: 1,
      isApproved: true,
      status: "active",
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const initialFee = await Fee.create({
      studentId: newStudent._id,
      classId,
      feeType: "Tuition",
      semester: 1,
      totalAmount: program.baseTuitionFee || 50000,
      dueDate,
      status: "pending",
    });

    res.status(201).json({
      message: "Student successfully enrolled into the University Node!",
      student: {
        _id: newStudent._id,
        name: newStudent.name,
        regNo: newStudent.roll,
        email: newStudent.email,
        defaultPassword,
      },
      financials: {
        invoiceCreated: true,
        amount: initialFee.totalAmount,
        dueDate: initialFee.dueDate,
      },
    });
  } catch (err) {
    console.error("MASTER ENROLLMENT ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email or Registration Number already exists.",
      });
    }

    res.status(500).json({
      message: "Enrollment pipeline failure. Check server logs.",
    });
  }
};