import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Import routes
import feeRoutes from "./routes/feeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import studentAttendanceRoutes from "./routes/studentAttendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";


dotenv.config();
connectDB();

const app = express();

/* =========================
      MIDDLEWARE
========================= */

app.use(cors());

/* ⭐ IMPORTANT LIMIT FIX */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morgan("dev"));

/* =========================
        ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/class", classRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/student/attendance", studentAttendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/university", universityRoutes);

app.get("/", (req, res) => {
  res.send("Backend server running...");
});

/* =========================
        ERROR HANDLER
========================= */

app.use((err, req, res, next) => {

  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    message: err.message || "Server error"
  });

});

/* =========================
        SERVER
========================= */

const PORT = process.env.PORT || 8000;

console.log("Cloudinary Key:", process.env.CLOUDINARY_KEY);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});