import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Log / mark attendance
// @route   POST /api/attendance
// @access  Private (Faculty/Admin)
export const logAttendance = async (req, res) => {
  const { studentId, studentEmail, subject, date, status, sessionType } = req.body;

  let finalStudentId = studentId;

  try {
    if (!finalStudentId && studentEmail) {
      const foundStudent = await User.findOne({ email: studentEmail.toLowerCase() });
      if (foundStudent) {
        finalStudentId = foundStudent._id;
      }
    }

    if (!finalStudentId || !subject || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId (or studentEmail), subject, and status',
      });
    }

    const student = await User.findById(finalStudentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const attendance = await Attendance.create({
      student: studentId,
      subject,
      date: date || new Date(),
      status,
      sessionType: sessionType || 'Lecture',
      updatedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error logging attendance',
    });
  }
};

// @desc    Get student's own attendance summary
// @route   GET /api/attendance/my
// @access  Private (Student)
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const records = await Attendance.find({ student: studentId });

    // Summarize records by subject
    const summary = {};

    records.forEach((record) => {
      if (!summary[record.subject]) {
        summary[record.subject] = {
          subject: record.subject,
          attended: 0,
          total: 0,
          history: [],
        };
      }

      summary[record.subject].total += 1;
      if (record.status === 'present' || record.status === 'late') {
        summary[record.subject].attended += 1;
      }

      summary[record.subject].history.push({
        id: record._id,
        date: record.date,
        status: record.status,
        sessionType: record.sessionType,
      });
    });

    // Calculate percentages
    const summaryArray = Object.values(summary).map((item) => {
      const percentage = item.total > 0 ? ((item.attended / item.total) * 100).toFixed(1) : 0;
      return {
        ...item,
        percentage: parseFloat(percentage),
      };
    });

    res.status(200).json({
      success: true,
      recordsCount: records.length,
      summary: summaryArray,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error retrieving attendance',
    });
  }
};

// @desc    Predict attendance adjustments
// @route   POST /api/attendance/predict
// @access  Private (Student)
export const predictAttendance = async (req, res) => {
  const { subject, nextClassesStatus } = req.body; // nextClassesStatus: Array of 'present' or 'absent'

  if (!subject || !Array.isArray(nextClassesStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide subject name and predicted classes status array',
    });
  }

  try {
    const studentId = req.user.id;
    const records = await Attendance.find({ student: studentId, subject });

    let currentAttended = 0;
    let currentTotal = records.length;

    records.forEach((record) => {
      if (record.status === 'present' || record.status === 'late') {
        currentAttended += 1;
      }
    });

    let predictedAttended = currentAttended;
    let predictedTotal = currentTotal;

    nextClassesStatus.forEach((status) => {
      predictedTotal += 1;
      if (status === 'present') {
        predictedAttended += 1;
      }
    });

    const currentPercentage = currentTotal > 0 ? ((currentAttended / currentTotal) * 100).toFixed(1) : 0;
    const predictedPercentage = predictedTotal > 0 ? ((predictedAttended / predictedTotal) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      subject,
      current: {
        total: currentTotal,
        attended: currentAttended,
        percentage: parseFloat(currentPercentage),
      },
      prediction: {
        total: predictedTotal,
        attended: predictedAttended,
        percentage: parseFloat(predictedPercentage),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error predicting attendance',
    });
  }
};

// @desc    Get low attendance report
// @route   GET /api/attendance/low-alerts
// @access  Private (Faculty/Admin)
export const getLowAttendanceAlerts = async (req, res) => {
  try {
    // Aggregation query to find students with subject attendance under 75%
    const threshold = 75.0;

    const reports = await Attendance.aggregate([
      {
        $group: {
          _id: { student: '$student', subject: '$subject' },
          total: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          student: '$_id.student',
          subject: '$_id.subject',
          total: 1,
          attended: 1,
          percentage: {
            $multiply: [{ $divide: ['$attended', '$total'] }, 100],
          },
        },
      },
      {
        $match: {
          percentage: { $lt: threshold },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $unwind: '$studentInfo',
      },
      {
        $project: {
          subject: 1,
          total: 1,
          attended: 1,
          percentage: 1,
          studentName: '$studentInfo.name',
          studentEmail: '$studentInfo.email',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: reports.length,
      alerts: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error fetching low attendance alerts',
    });
  }
};
