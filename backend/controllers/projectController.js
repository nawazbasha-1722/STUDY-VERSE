import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Student)
export const createProject = async (req, res) => {
  const { name, description, memberEmails } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Please provide project name' });
  }

  try {
    const memberIds = [req.user.id]; // Creator is member

    // Resolve member emails to MongoDB ObjectIds
    if (Array.isArray(memberEmails) && memberEmails.length > 0) {
      const users = await User.find({ email: { $in: memberEmails.map((e) => e.toLowerCase().trim()) } });
      users.forEach((u) => {
        if (u._id.toString() !== req.user.id) {
          memberIds.push(u._id);
        }
      });
    }

    const project = await Project.create({
      name,
      description,
      creator: req.user.id,
      members: memberIds,
      tasks: [],
      messages: [],
    });

    res.status(201).json({
      success: true,
      message: 'Project workspace created!',
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project',
    });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects
// @access  Private (Student)
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate('creator', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching projects',
    });
  }
};

// @desc    Get project details
// @route   GET /api/projects/:id
// @access  Private (Student)
export const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name')
      .populate('members', 'name email')
      .populate('tasks.assignee', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project workspace not found' });
    }

    // Security check: ensure user is member
    if (!project.members.some((m) => m._id.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching project details',
    });
  }
};

// @desc    Add a task to the project Kanban
// @route   POST /api/projects/:id/tasks
// @access  Private (Student)
export const createTask = async (req, res) => {
  const { title, description, assigneeEmail, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Please provide task title' });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let assigneeId = undefined;
    if (assigneeEmail) {
      const user = await User.findOne({ email: assigneeEmail.toLowerCase().trim() });
      if (user) {
        assigneeId = user._id;
      }
    }

    const newTask = {
      title,
      description,
      assignee: assigneeId,
      dueDate: dueDate || undefined,
      status: 'todo',
    };

    project.tasks.push(newTask);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Task added to Kanban!',
      tasks: project.tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding task',
    });
  }
};

// @desc    Update task status
// @route   PUT /api/projects/:id/tasks/:taskId
// @access  Private (Student)
export const updateTaskStatus = async (req, res) => {
  const { status } = req.body; // todo, doing, done

  if (!['todo', 'doing', 'done'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = project.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated!',
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task status',
    });
  }
};

// @desc    Post message in project chat
// @route   POST /api/projects/:id/message
// @access  Private (Student)
export const addProjectMessage = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const newMsg = {
      sender: req.user.id,
      senderName: req.user.name,
      text,
      timestamp: new Date(),
    };

    project.messages.push(newMsg);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Message posted!',
      chat: newMsg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
