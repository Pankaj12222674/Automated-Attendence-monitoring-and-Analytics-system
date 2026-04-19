import Course from "../models/Course.js";
import Department from "../models/Department.js";
import Program from "../models/Program.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";

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

    // Also inject this newly created Master Course as a 'Subject' into all EXISTING classes matching the Program & Semester
    const matchingClasses = await Class.find({ programId, semester });
    if (matchingClasses.length > 0) {
      for (const cls of matchingClasses) {
        // Create actual Subject mapped to each existing class/section
        const createdSubject = await Subject.create({
          name: newCourse.name,
          code: newCourse.courseCode,
          credits: newCourse.credits,
          courseType: newCourse.isElective ? "elective" : "core",
          departmentId: cls.departmentId || null,
          classId: cls._id,
          teacherId: cls.teacherId || null, // Assuming the class advisor/teacher or null
          isActive: true
        });

        // Add created subject _id to the class's subject array
        cls.subjects.push(createdSubject._id);
        await cls.save();
      }
    }

    res.status(201).json({ message: "Master Course added to Catalog and assigned to matching existing classes.", course: newCourse });
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
