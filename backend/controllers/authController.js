import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'studyversesupersecretjwtkey123!', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      verificationToken,
      verificationTokenExpire,
    });

    // Send email verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const emailMessage = `Welcome to StudyVerse ⭐, ${name}!\n\nPlease verify your email by clicking on the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'StudyVerse ⭐ - Email Verification',
        message: emailMessage,
        html: `
          <h3>Welcome to StudyVerse ⭐!</h3>
          <p>Please click the link below to verify your account:</p>
          <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: #aa3bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a>
          <p>Or copy this link to your browser: ${verificationUrl}</p>
        `,
      });
    } catch (mailErr) {
      console.error('Email registration verification failed to send', mailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password',
    });
  }

  try {
    // Find user and select password (since it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        gpaStats: user.gpaStats,
        placementMetrics: user.placementMetrics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error during login',
    });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error verifying email',
    });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user registered with this email',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save({ validateBeforeSave: false });

    // Send reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const emailMessage = `You requested a password reset. Please click on the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'StudyVerse ⭐ - Password Reset Request',
        message: emailMessage,
        html: `
          <h3>Password Reset Request</h3>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #aa3bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>Or copy this link to your browser: ${resetUrl}</p>
        `,
      });
    } catch (mailErr) {
      console.error('Password reset email failed to send', mailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error in forgotPassword',
    });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error in resetPassword',
    });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        gpaStats: user.gpaStats,
        placementMetrics: user.placementMetrics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error in getMe',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, phone, department, year, avatar, regdno, platform, github, leetcode, linkedin } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.profile.phone = phone;
    if (department !== undefined) user.profile.department = department;
    if (year !== undefined) user.profile.year = year;
    if (avatar !== undefined) user.profile.avatar = avatar;
    if (regdno !== undefined) user.profile.regdno = regdno;
    if (platform !== undefined) user.profile.platform = platform;
    if (github !== undefined) user.profile.github = github;
    if (leetcode !== undefined) user.profile.leetcode = leetcode;
    if (linkedin !== undefined) user.profile.linkedin = linkedin;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        gpaStats: user.gpaStats,
        placementMetrics: user.placementMetrics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error updating profile',
    });
  }
};
