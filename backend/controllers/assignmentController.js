import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";

/* =======================================
      TEACHER: CREATE ASSIGNMENT
======================================= */
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subjectId, classId, dueDate, totalMarks } = req.body;

    if (!title || !description || !subjectId || !classId || !dueDate) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Verify the class and subject exist
    const cohort = await Class.findById(classId);
    if (!cohort) return res.status(404).json({ message: "Cohort not found." });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Course not found." });

    const assignment = await Assignment.create({
      title,
      description,
      subjectId,
      classId,
      teacherId: req.user._id, // The logged-in professor
      dueDate,
      totalMarks: totalMarks || 100,
      status: "published"
    });

    res.status(201).json({
      message: "Assignment published successfully.",
      assignment
    });
  } catch (err) {
    console.error("CREATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Failed to create assignment." });
  }
};

/* =======================================
      SHARED: GET CLASS ASSIGNMENTS
======================================= */
// Students use this to see their homework, Teachers use it to see what they assigned
export const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;

    const assignments = await Assignment.find({ classId })
      .populate("subjectId", "name code")
      .populate("teacherId", "name designation")
      .sort({ dueDate: 1 }); // Sort by closest deadline

    res.json({ assignments });
  } catch (err) {
    console.error("GET ASSIGNMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch assignments." });
  }
};

/* =======================================
      STUDENT: SUBMIT ASSIGNMENT
======================================= */
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;
    const studentId = req.user._id;

    if (!assignmentId || !fileUrl) {
      return res.status(400).json({ message: "Assignment ID and File URL are required." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    // Check if already submitted
    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted this assignment." });
    }

    // Check if late
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    const submission = await Submission.create({
      assignmentId,
      studentId,
      fileUrl,
      status: isLate ? "late" : "submitted"
    });

    res.status(201).json({
      message: isLate ? "Submitted successfully (Marked as Late)" : "Submitted successfully.",
      submission
    });
  } catch (err) {
    console.error("SUBMIT ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Failed to submit assignment." });
  }
};

/* =======================================
      TEACHER: GET SUBMISSIONS
======================================= */
// Professor views all students who submitted a specific assignment
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email roll")
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    console.error("GET SUBMISSIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

/* =======================================
      TEACHER: GRADE SUBMISSION
======================================= */
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marksObtained, feedback } = req.body;

    if (marksObtained === undefined) {
      return res.status(400).json({ message: "Marks are required to grade." });
    }

    const submission = await Submission.findById(submissionId).populate("assignmentId");
    if (!submission) return res.status(404).json({ message: "Submission not found." });

    if (marksObtained > submission.assignmentId.totalMarks) {
      return res.status(400).json({ 
        message: `Marks cannot exceed the total of ${submission.assignmentId.totalMarks}.` 
      });
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback || "";
    submission.status = "graded";
    submission.gradedBy = req.user._id;

    await submission.save();

    res.json({ message: "Submission graded successfully.", submission });
  } catch (err) {
    console.error("GRADE SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Failed to grade submission." });
  }
};

/* =======================================
      STUDENT: GET MY SUBMISSIONS
======================================= */
// Student checks their grades and feedback
export const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;

    const submissions = await Submission.find({ studentId })
      .populate({
        path: "assignmentId",
        select: "title dueDate totalMarks subjectId",
        populate: { path: "subjectId", select: "name code" }
      })
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    console.error("GET MY SUBMISSIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch your submissions." });
  }
};