import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import User from "../models/User.js";

// @desc    Get all timetable entries (with optional filtering by classId or teacherId)
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.teacherId) filter.teacherId = req.query.teacherId;

    const timetables = await Timetable.find(filter)
      .populate("subjectId", "name code")
      .populate("classId", "name semester")
      .populate("teacherId", "name email");

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a timetable entry with Clash Detection
// @route   POST /api/timetable
// @access  Private/Admin
export const createTimetableEntry = async (req, res) => {
  try {
    const { day, time, subjectId, classId, teacherId } = req.body;

    // 1. Clash Detection: Class clash
    const classClash = await Timetable.findOne({ day, time, classId });
    if (classClash) {
      return res.status(400).json({
        success: false,
        message: `Clash Detected: Class already has a session on ${day} at ${time}.`,
      });
    }

    // 2. Clash Detection: Teacher clash
    const teacherClash = await Timetable.findOne({ day, time, teacherId });
    if (teacherClash) {
      return res.status(400).json({
        success: false,
        message: `Clash Detected: Teacher is already assigned to a session on ${day} at ${time}.`,
      });
    }

    const timetable = await Timetable.create({
      day,
      time,
      subjectId,
      classId,
      teacherId,
    });

    res.status(201).json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auto-Generate Timetable (Advanced DSA: Backtracking/Greedy)
// @route   POST /api/timetable/generate
// @access  Private/Admin
export const generateAutoTimetable = async (req, res) => {
  try {
    const { classId, subjectsData, days, timeSlots } = req.body;

    if (!classId || !subjectsData || !days || !timeSlots) {
      return res.status(400).json({ success: false, message: "Missing required generation parameters." });
    }

    const newEntries = [];
    const classTimetableMap = new Map();
    const teacherTimetableMap = new Map();

    // Fetch existing timetables, EXCLUDING the current class so we can overwrite its slots safely later
    const existingTimetables = await Timetable.find({ classId: { $ne: classId } });
    existingTimetables.forEach((t) => {
      classTimetableMap.set(`${t.classId}-${t.day}-${t.time}`, true);
      teacherTimetableMap.set(`${t.teacherId}-${t.day}-${t.time}`, true);
    });

    const requirements = [];
    subjectsData.forEach((sd) => {
      for (let i = 0; i < sd.frequency; i++) {
        requirements.push({ subjectId: sd.subjectId, teacherId: sd.teacherId });
      }
    });

    let reqIndex = 0;
    for (const day of days) {
      for (const time of timeSlots) {
        if (reqIndex >= requirements.length) break;

        const reqSlot = requirements[reqIndex];
        const classKey = `${classId}-${day}-${time}`;
        const teacherKey = `${reqSlot.teacherId}-${day}-${time}`;

        if (!classTimetableMap.has(classKey) && !teacherTimetableMap.has(teacherKey)) {
          newEntries.push({
            classId,
            subjectId: reqSlot.subjectId,
            teacherId: reqSlot.teacherId,
            day,
            time
          });

          classTimetableMap.set(classKey, true);
          teacherTimetableMap.set(teacherKey, true);

          reqIndex++;
        }
      }
      if (reqIndex >= requirements.length) break;
    }

    if (reqIndex < requirements.length) {
      return res.status(400).json({
        success: false,
        message: `Failed to generate timetable. Too many clashes or not enough slots. Could only place ${reqIndex} out of ${requirements.length} sessions.`,
        partialData: newEntries
      });
    }

    // Now that generation is successful, safely remove the old timetable entries for this class
    await Timetable.deleteMany({ classId });
    const createdEntries = await Timetable.insertMany(newEntries);

    res.status(201).json({
      success: true,
      message: "Timetable generated successfully with 0 clashes.",
      data: createdEntries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/Admin
export const deleteTimetableEntry = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ success: false, message: "Timetable entry not found" });
    }
    res.status(200).json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
