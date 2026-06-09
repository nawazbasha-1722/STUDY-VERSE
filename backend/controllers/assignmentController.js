import Assignment from '../models/Assignment.js';
import { uploadFile } from '../services/cloudinary.js';

// @desc    Create new assignment task
// @route   POST /api/assignments
// @access  Private (Faculty/Admin)
export const createAssignment = async (req, res) => {
  const { title, description, subject, dueDate } = req.body;

  if (!title || !subject || !dueDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, subject, and dueDate',
    });
  }

  try {
    const assignment = await Assignment.create({
      title,
      description,
      subject,
      dueDate,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully!',
      assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error creating assignment',
    });
  }
};

// @desc    Get assignments list
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    // Format list adding current user submission status
    const studentId = req.user.id;
    const formatted = assignments.map((assign) => {
      const submission = assign.submissions.find((s) => s.student.toString() === studentId);

      let status = 'Pending';
      if (submission) {
        status = submission.status === 'late' ? 'Late Submission' : 'Submitted';
      } else if (new Date() > new Date(assign.dueDate)) {
        status = 'Overdue';
      }

      return {
        id: assign._id,
        title: assign.title,
        description: assign.description,
        subject: assign.subject,
        dueDate: assign.dueDate,
        createdBy: assign.createdBy,
        status,
        submissionDetails: submission || null,
        submissions: req.user.role !== 'student' ? assign.submissions : undefined, // Only show all submissions to faculty/admin
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      assignments: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error fetching assignments',
    });
  }
};

// @desc    Submit file to assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a submission document',
    });
  }

  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment task not found',
      });
    }

    // Check if student already submitted
    const existingIndex = assignment.submissions.findIndex((s) => s.student.toString() === req.user.id);
    if (existingIndex > -1) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    const fileUrl = await uploadFile(req.file.path, 'submissions');

    // Calculate submission status: check if past deadline
    const status = new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted';

    const submission = {
      student: req.user.id,
      fileUrl,
      submittedAt: new Date(),
      status,
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.status(200).json({
      success: true,
      message: status === 'late' ? 'Submitted late' : 'Submitted on time',
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error submitting task',
    });
  }
};

// @desc    Grade a student submission
// @route   POST /api/assignments/:id/grade/:submissionId
// @access  Private (Faculty/Admin)
export const gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body;

  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission details not found',
      });
    }

    if (grade) submission.grade = grade;
    if (feedback) submission.feedback = feedback;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully!',
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error grading submission',
    });
  }
};
