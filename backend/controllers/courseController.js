import Course from "../models/Course.js";
import Department from "../models/Department.js";
import Program from "../models/Program.js";

// Create a Master Course
export const createCourse = async (req, res) => {
  try {
    const { courseCode, name, description, credits, programId, semester, isElective } = req.body;

    if (!courseCode || !name || !credits || !programId || !semester) {
      return res.status(400).json({ message: "Missing required fields for Course setup." });
    }

    const exists = await Course.findOne({ courseCode });
    if (exists) {
      return res.status(400).json({ message: "A Course with this code already exists." });
    }

    const newCourse = await Course.create({
      courseCode,
      name,
      description,
      credits,
      programId,
      semester,
      isElective
    });

    res.status(201).json({ message: "Master Course added to Catalog.", course: newCourse });
  } catch (error) {
    console.error("COURSE CREATION ERROR:", error);
    res.status(500).json({ message: "Error creating course." });
  }
};

// Get Courses by Program and Semester
export const getCourses = async (req, res) => {
  try {
    const { programId, semester } = req.query;
    const filter = { isActive: true };

    if (programId) filter.programId = programId;
    if (semester) filter.semester = semester;

    const courses = await Course.find(filter).populate("programId", "name");
    res.json({ courses });
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    res.status(500).json({ message: "Error fetching courses." });
  }
};
