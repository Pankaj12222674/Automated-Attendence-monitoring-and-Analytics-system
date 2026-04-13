import QRCode from "qrcode";
import QRSession from "../models/QRSession.js";
import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";

/* ======================================================
   1) GENERATE QR (Teacher)
====================================================== */
export const generateQR = async (req, res) => {
  try {
    const { classId, subjectId, expiresIn = 30 } = req.body;

    if (!classId || !subjectId)
      return res.status(400).json({ message: "Missing classId or subjectId" });

    // Create session expiry time
    const expiresAt = Date.now() + expiresIn * 1000;

    // Create QR Session in DB
    const session = await QRSession.create({
      classId,
      subjectId,
      teacherId: req.user._id,
      expiresAt,
    });

    // QR payload
    const payload = {
      sessionId: session._id,
      classId,
      subjectId,
      expiresAt,
    };

    // Generate QR as image
    const qrImage = await QRCode.toDataURL(JSON.stringify(payload));

    res.json({
      qr: qrImage,
      sessionId: session._id,
      expiresAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ======================================================
   2) SCAN QR (Student)
====================================================== */
export const scanQR = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token)
      return res.status(400).json({ message: "Missing QR token" });

    const data = JSON.parse(token);
    const { sessionId, classId, subjectId, expiresAt } = data;

    // Check expiry
    if (Date.now() > expiresAt)
      return res.status(400).json({ message: "QR expired" });

    const session = await QRSession.findById(sessionId);
    if (!session)
      return res.status(404).json({ message: "Invalid session" });

    // Prevent duplicate scanning
    const alreadyMarked = await Attendance.findOne({
      studentId: req.user._id,
      classId,
      subjectId,
      date: new Date().toISOString().slice(0, 10),
    });

    if (alreadyMarked)
      return res.status(400).json({ message: "Attendance already marked" });

    // Mark attendance
    const today = new Date().toISOString().slice(0, 10);

    await Attendance.create({
      studentId: req.user._id,
      classId,
      subjectId,
      teacherId: session.teacherId,
      date: today,
      time: new Date().toLocaleTimeString("en-IN"),
      method: "qr",
      status: "present",
    });

    res.json({ message: "Attendance marked successfully (QR)" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
