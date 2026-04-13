import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

/* =================================
            REGISTER USER
================================ */
export const registerUser = async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role = "student",
      classId,
      faceDescriptor,
      programId,
      departmentId,
      designation,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    email = email.toLowerCase().trim();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    /* ROLE VALIDATION */
    const allowedRoles = ["student", "teacher", "admin"];
    if (!allowedRoles.includes(role)) {
      role = "student";
    }

    /* FACE DESCRIPTOR SAFE PARSE */
    if (faceDescriptor) {
      try {
        faceDescriptor = JSON.parse(faceDescriptor);
      } catch {
        faceDescriptor = [];
      }
    }

    if (!Array.isArray(faceDescriptor)) {
      faceDescriptor = [];
    }

    /* IMAGE PATH */
    let imagePath = "";
    if (req.file) {
      imagePath = req.file.path || req.file.secure_url || "";
    }

    /* UNIVERSITY ROLL NUMBER GENERATION (Students Only) */
    let roll = null;
    if (role === "student") {
      const year = new Date().getFullYear();
      roll = `U${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    /* ADMIN AUTO APPROVED */
    const approved = role === "admin";

    const user = await User.create({
      name,
      email,
      password,
      role,
      classId: classId || null,
      programId: programId || null,
      departmentId: departmentId || null,
      designation: role === "teacher" ? designation || "Faculty Member" : undefined,
      roll,
      faceDescriptor,
      profileImage: imagePath,
      isApproved: approved,
    });

    res.status(201).json({
      message:
        role === "admin"
          ? "Admin registered successfully"
          : "Registration successful. Waiting for university admin approval",
      userId: user._id,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =================================
            LOGIN USER
================================ */
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    email = email.toLowerCase().trim();

    // First fetch raw user for password validation
    const rawUser = await User.findOne({ email });

    if (!rawUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!rawUser.isApproved) {
      return res.status(403).json({ message: "Account waiting for university admin approval" });
    }

    const match = await rawUser.matchPassword(password);

    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Re-fetch populated user for frontend convenience
    const user = await User.findById(rawUser._id)
      .populate("classId", "name semester academicYear")
      .populate("programId", "name")
      .populate("departmentId", "name")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found after authentication" });
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
        profileImage: user.profileImage,

        // University fields
        roll: user.roll,
        programId: user.programId,
        departmentId: user.departmentId,
        designation: user.designation,
        cgpa: user.cgpa,
        currentSemester: user.currentSemester,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =================================
        GET LOGGED IN USER (Profile)
================================ */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("classId", "name semester academicYear")
      .populate("programId", "name")
      .populate("departmentId", "name")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      classId: user.classId,
      profileImage: user.profileImage,
      createdAt: user.createdAt,

      // University fields
      roll: user.roll,
      programId: user.programId,
      departmentId: user.departmentId,
      designation: user.designation,
      cgpa: user.cgpa,
      currentSemester: user.currentSemester,
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

/* =================================
        GET USER BY ID
================================ */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("classId", "name semester academicYear")
      .populate("programId", "name")
      .populate("departmentId", "name")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* =================================
        FORGOT PASSWORD
================================ */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "University Portal: Password Reset",
      `Reset your university portal password using this secure link:

${resetLink}

This link expires in 10 minutes.`
    );

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

/* =================================
        RESET PASSWORD
================================ */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
``