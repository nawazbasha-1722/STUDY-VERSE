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
  const { semester, courses, isDirectSGPA, sgpa: directSgpa, totalCredits: directCredits } = req.body;

  if (!semester) {
    return res.status(400).json({
      success: false,
      message: 'Please provide semester',
    });
  }

  if (!isDirectSGPA && (!courses || !Array.isArray(courses))) {
    return res.status(400).json({
      success: false,
      message: 'Please provide courses list or select direct SGPA entry',
    });
  }

  try {
    const studentId = req.user.id;

    let mappedCourses = [];
    let sgpa = 0;
    let totalCredits = 0;

    if (isDirectSGPA) {
      if (directSgpa === undefined || directCredits === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Please provide SGPA and total credits for direct entry',
        });
      }
      sgpa = parseFloat(Number(directSgpa).toFixed(2)) || 0;
      totalCredits = Number(directCredits) || 0;
    } else {
      let totalEarnedPoints = 0;
      mappedCourses = courses.map((course) => {
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
      sgpa = totalCredits > 0 ? parseFloat((totalEarnedPoints / totalCredits).toFixed(2)) : 0;
    }

    // Save or update record
    let record = await AcademicRecord.findOne({ student: studentId, semester });

    if (record) {
      record.courses = mappedCourses;
      record.sgpa = sgpa;
      record.totalCredits = totalCredits;
      record.isDirectSGPA = !!isDirectSGPA;
      await record.save();
    } else {
      record = await AcademicRecord.create({
        student: studentId,
        semester,
        courses: mappedCourses,
        sgpa,
        totalCredits,
        isDirectSGPA: !!isDirectSGPA,
      });
    }

    // Recalculate CGPA and update cached User stats
    const allRecords = await AcademicRecord.find({ student: studentId });
    const user = await User.findById(studentId);

    let cumulativeCredits = user.gpaStats?.previousCredits || 0;
    let cumulativeEarnedPoints = (user.gpaStats?.previousCgpa || 0) * cumulativeCredits;
    const semestersCache = [];

    allRecords.forEach((rec) => {
      semestersCache.push({
        semester: rec.semester,
        sgpa: rec.sgpa,
      });

      if (rec.isDirectSGPA) {
        cumulativeCredits += rec.totalCredits || 0;
        cumulativeEarnedPoints += rec.sgpa * (rec.totalCredits || 0);
      } else {
        rec.courses.forEach((c) => {
          cumulativeCredits += c.credits;
          cumulativeEarnedPoints += c.points * c.credits;
        });
      }
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
      previousCgpa: user.gpaStats?.previousCgpa || 0,
      previousCredits: user.gpaStats?.previousCredits || 0,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error retrieving GPA details',
    });
  }
};

// @desc    Update baseline CGPA and Credits
// @route   POST /api/gpa/baseline
// @access  Private (Student)
export const updateBaselineGPA = async (req, res) => {
  const { previousCgpa, previousCredits } = req.body;

  if (previousCgpa === undefined || previousCredits === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide previousCgpa and previousCredits',
    });
  }

  try {
    const studentId = req.user.id;

    // Save baseline in User
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.gpaStats = user.gpaStats || {};
    user.gpaStats.previousCgpa = parseFloat(Number(previousCgpa).toFixed(2)) || 0;
    user.gpaStats.previousCredits = Number(previousCredits) || 0;

    // Recalculate CGPA
    const allRecords = await AcademicRecord.find({ student: studentId });

    let cumulativeCredits = user.gpaStats.previousCredits;
    let cumulativeEarnedPoints = user.gpaStats.previousCgpa * cumulativeCredits;
    const semestersCache = [];

    allRecords.forEach((rec) => {
      semestersCache.push({
        semester: rec.semester,
        sgpa: rec.sgpa,
      });

      if (rec.isDirectSGPA) {
        cumulativeCredits += rec.totalCredits || 0;
        cumulativeEarnedPoints += rec.sgpa * (rec.totalCredits || 0);
      } else {
        rec.courses.forEach((c) => {
          cumulativeCredits += c.credits;
          cumulativeEarnedPoints += c.points * c.credits;
        });
      }
    });

    const cgpa = cumulativeCredits > 0 ? parseFloat((cumulativeEarnedPoints / cumulativeCredits).toFixed(2)) : 0;
    user.gpaStats.cgpa = cgpa;
    user.gpaStats.semesters = semestersCache.sort((a, b) => a.semester - b.semester);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Baseline GPA updated successfully',
      cgpa,
      previousCgpa: user.gpaStats.previousCgpa,
      previousCredits: user.gpaStats.previousCredits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error updating baseline GPA',
    });
  }
};
