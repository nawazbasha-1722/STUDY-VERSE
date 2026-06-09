import StudyPlanner from '../models/StudyPlanner.js';

// Helper to get or create student planner
const findOrCreatePlanner = async (studentId) => {
  let planner = await StudyPlanner.findOne({ student: studentId });
  if (!planner) {
    planner = await StudyPlanner.create({ student: studentId, goals: [], countdowns: [], studyLogs: [] });
  }
  return planner;
};

// @desc    Get study planner hub
// @route   GET /api/planner
// @access  Private (Student)
export const getPlanner = async (req, res) => {
  try {
    const planner = await findOrCreatePlanner(req.user.id);
    res.status(200).json({
      success: true,
      planner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error retrieving planner hub',
    });
  }
};

// @desc    Add a planner goal checklist item
// @route   POST /api/planner/goals
// @access  Private (Student)
export const addGoal = async (req, res) => {
  const { text, type } = req.body;

  if (!text || !type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide goal text and type (daily, weekly, monthly)',
    });
  }

  try {
    const planner = await findOrCreatePlanner(req.user.id);
    planner.goals.push({ text, type, completed: false });
    await planner.save();

    res.status(201).json({
      success: true,
      message: 'Goal checklist item added!',
      goals: planner.goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error adding checklist goal',
    });
  }
};

// @desc    Toggle checklist item completed state
// @route   PUT /api/planner/goals/:goalId
// @access  Private (Student)
export const toggleGoal = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ student: req.user.id });
    if (!planner) {
      return res.status(404).json({ success: false, message: 'Planner not found' });
    }

    const goal = planner.goals.id(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal item not found' });
    }

    goal.completed = !goal.completed;
    await planner.save();

    res.status(200).json({
      success: true,
      message: 'Goal status toggled!',
      goals: planner.goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error toggling goal status',
    });
  }
};

// @desc    Delete goal checklist item
// @route   DELETE /api/planner/goals/:goalId
// @access  Private (Student)
export const deleteGoal = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ student: req.user.id });
    if (!planner) {
      return res.status(404).json({ success: false, message: 'Planner not found' });
    }

    planner.goals.pull({ _id: req.params.goalId });
    await planner.save();

    res.status(200).json({
      success: true,
      message: 'Goal item deleted!',
      goals: planner.goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error deleting goal',
    });
  }
};

// @desc    Add target countdown event
// @route   POST /api/planner/countdowns
// @access  Private (Student)
export const addCountdown = async (req, res) => {
  const { title, targetDate } = req.body;

  if (!title || !targetDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide countdown title and targetDate',
    });
  }

  try {
    const planner = await findOrCreatePlanner(req.user.id);
    planner.countdowns.push({ title, targetDate });
    await planner.save();

    res.status(201).json({
      success: true,
      message: 'Countdown schedule added!',
      countdowns: planner.countdowns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error adding countdown',
    });
  }
};

// @desc    Delete countdown event
// @route   DELETE /api/planner/countdowns/:countdownId
// @access  Private (Student)
export const deleteCountdown = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ student: req.user.id });
    if (!planner) {
      return res.status(404).json({ success: false, message: 'Planner not found' });
    }

    planner.countdowns.pull({ _id: req.params.countdownId });
    await planner.save();

    res.status(200).json({
      success: true,
      message: 'Countdown deleted!',
      countdowns: planner.countdowns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error deleting countdown',
    });
  }
};

// @desc    Log subject study duration logs
// @route   POST /api/planner/logs
// @access  Private (Student)
export const logStudyTime = async (req, res) => {
  const { subject, duration } = req.body;

  if (!subject || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Please provide subject and duration (minutes)',
    });
  }

  try {
    const planner = await findOrCreatePlanner(req.user.id);
    planner.studyLogs.push({ subject, duration, date: new Date() });
    await planner.save();

    res.status(201).json({
      success: true,
      message: 'Study duration logged!',
      studyLogs: planner.studyLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error logging study duration',
    });
  }
};
