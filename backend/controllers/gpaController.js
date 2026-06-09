import AcademicRecord from '../models/AcademicRecord.js';
import User from '../models/User.js';

// Grade to Points mapping
const GRADE_POINTS = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

// @desc    Add or update academic record for a semester
// @route   POST /api/gpa/semester
// @access  Private (Student)
export const addSemesterRecord = async (req, res) => {
  const { semester, courses } = req.body;

  if (!semester || !courses || !Array.isArray(courses)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide semester and courses list',
    });
  }

  try {
    const studentId = req.user.id;

    // Calculate SGPA for the semester
    let totalCredits = 0;
    let totalEarnedPoints = 0;

    const mappedCourses = courses.map((course) => {
      const points = GRADE_POINTS[course.grade.toUpperCase()] || 0;
      totalCredits += course.credits;
      totalEarnedPoints += points * course.credits;

      return {
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.credits,
        grade: course.grade.toUpperCase(),
        points,
      };
    });

    const sgpa = totalCredits > 0 ? parseFloat((totalEarnedPoints / totalCredits).toFixed(2)) : 0;

    // Save or update record
    let record = await AcademicRecord.findOne({ student: studentId, semester });

    if (record) {
      record.courses = mappedCourses;
      record.sgpa = sgpa;
      await record.save();
    } else {
      record = await AcademicRecord.create({
        student: studentId,
        semester,
        courses: mappedCourses,
        sgpa,
      });
    }

    // Recalculate CGPA and update cached User stats
    const allRecords = await AcademicRecord.find({ student: studentId });

    let cumulativeCredits = 0;
    let cumulativeEarnedPoints = 0;
    const semestersCache = [];

    allRecords.forEach((rec) => {
      semestersCache.push({
        semester: rec.semester,
        sgpa: rec.sgpa,
      });

      rec.courses.forEach((c) => {
        cumulativeCredits += c.credits;
        cumulativeEarnedPoints += c.points * c.credits;
      });
    });

    const cgpa = cumulativeCredits > 0 ? parseFloat((cumulativeEarnedPoints / cumulativeCredits).toFixed(2)) : 0;

    // Update user cache
    await User.findByIdAndUpdate(studentId, {
      $set: {
        'gpaStats.cgpa': cgpa,
        'gpaStats.semesters': semestersCache.sort((a, b) => a.semester - b.semester),
      },
    });

    res.status(201).json({
      success: true,
      message: `Semester ${semester} record saved! SGPA: ${sgpa}`,
      record,
      cgpa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error saving academic record',
    });
  }
};

// @desc    Get student's own GPA history details
// @route   GET /api/gpa/history
// @access  Private (Student)
export const getMyGPADetails = async (req, res) => {
  try {
    const studentId = req.user.id;
    const records = await AcademicRecord.find({ student: studentId }).sort({ semester: 1 });

    const user = await User.findById(studentId);

    res.status(200).json({
      success: true,
      cgpa: user.gpaStats?.cgpa || 0,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error retrieving GPA details',
    });
  }
};
