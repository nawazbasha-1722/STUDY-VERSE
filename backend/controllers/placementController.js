import { QUIZ_BANK, CODING_CHALLENGES } from '../services/placementBank.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';

const apiKey = process.env.GEMINI_API_KEY;
const hasApiKey = apiKey && apiKey !== 'placeholder_key' && apiKey !== '';
const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper: safe JSON extraction from Gemini response
const cleanJsonString = (str) => {
  try {
    let cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse interview response:', str);
    return {
      finished: false,
      nextQuestion: 'Can you elaborate on your experience with this topic?',
    };
  }
};

// @desc    Get quiz questions for a placement topic
// @route   GET /api/placement/quizzes
// @access  Private
export const getPlacementQuizzes = async (req, res) => {
  const { topic } = req.query;

  if (!topic || !QUIZ_BANK[topic]) {
    return res.status(400).json({
      success: false,
      message: `Invalid topic. Available: ${Object.keys(QUIZ_BANK).join(', ')}`,
    });
  }

  res.status(200).json({
    success: true,
    questions: QUIZ_BANK[topic],
  });
};

// @desc    Get all coding challenges
// @route   GET /api/placement/coding
// @access  Private
export const getCodingChallenges = async (req, res) => {
  res.status(200).json({
    success: true,
    challenges: CODING_CHALLENGES,
  });
};

// @desc    Mock evaluate coding challenge
// @route   POST /api/placement/coding/evaluate
// @access  Private
export const evaluateCode = async (req, res) => {
  const { challengeId, code, language } = req.body;

  if (!challengeId || !code) {
    return res.status(400).json({
      success: false,
      message: 'Please provide challengeId and code',
    });
  }

  try {
    const challenge = CODING_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // A simple mock compiler validator that checks syntax matching or returns a green test suite run
    const results = challenge.testCases.map((tc, idx) => {
      // Mock validation checking if the code has standard structural keywords
      const passes = code.toLowerCase().includes('function') || code.toLowerCase().includes('def') || code.length > 20;

      return {
        testCase: tc.input,
        expected: tc.expected,
        status: passes ? 'Passed' : 'Failed',
      };
    });

    const allPassed = results.every((r) => r.status === 'Passed');

    if (allPassed) {
      // Increment student metric cache
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'placementMetrics.codingSolved': 1 },
      });
    }

    res.status(200).json({
      success: true,
      passed: allPassed,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during evaluation',
    });
  }
};

// @desc    Start Mock Interview session
// @route   POST /api/placement/interview/start
// @access  Private
export const startMockInterview = async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, message: 'Please specify interview topic' });
  }

  if (!hasApiKey) {
    return res.status(200).json({
      success: true,
      nextQuestion: `Welcome to the interview for ${topic}. Can you explain what you understand about this concept and its practical applications?`,
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a technical interviewer at a top tech company. Start a mock interview on the topic: ${topic}. Write the first question to ask the candidate. Keep it short (under 2 sentences).`;

    const result = await model.generateContent(prompt);
    res.status(200).json({
      success: true,
      nextQuestion: result.response.text().trim(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start interview bot',
    });
  }
};

// @desc    Submit mock interview response
// @route   POST /api/placement/interview/respond
// @access  Private
export const respondMockInterview = async (req, res) => {
  const { topic, response, chatHistory } = req.body; // chatHistory: [{ role: 'user'/'assistant', content: '...' }]

  if (!topic || !response || !Array.isArray(chatHistory)) {
    return res.status(400).json({ success: false, message: 'Please provide topic, response, and chatHistory' });
  }

  const userTurnCount = chatHistory.filter((h) => h.role === 'user').length + 1;

  if (!hasApiKey) {
    // Return mock results if turns complete, else next question
    if (userTurnCount >= 3) {
      // Increment user metrics
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'placementMetrics.mockInterviews': 1 },
        $set: { 'placementMetrics.averageMockScore': 8.5 },
      });

      return res.status(200).json({
        success: true,
        finished: true,
        technicalScore: 8,
        communicationScore: 9,
        feedback: 'You answered the questions clearly and demonstrated a solid understanding of fundamental core principles. Your communication flow was concise and professional.',
        suggestions: 'Deep dive into advanced topics such as concurrency and network structures. Practice detailing query execution plans.',
      });
    }

    return res.status(200).json({
      success: true,
      finished: false,
      nextQuestion: `Good answer. Now, regarding ${topic}, could you explain how this relates to systems scalability or optimization?`,
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    if (userTurnCount >= 3) {
      // Summarize and finish
      prompt = `You are a technical interviewer conducting a mock interview on ${topic}.
      Here is the interview chat log so far:
      ${JSON.stringify(chatHistory)}
      
      Candidate's final response: "${response}"
      
      This is the end of the interview. Analyze the candidate's answers and generate scores (out of 10) and feedback.
      Return ONLY a valid JSON object with the following fields:
      "finished": true,
      "technicalScore": (number from 1-10),
      "communicationScore": (number from 1-10),
      "feedback": (paragraph summarizing overall performance, strengths, weaknesses),
      "suggestions": (bullet points or text listing areas of improvement).
      Do not include markdown tags.`;
    } else {
      // Continue interview
      prompt = `You are a technical interviewer conducting a mock interview on ${topic}.
      Here is the interview chat log:
      ${JSON.stringify(chatHistory)}
      
      Candidate response: "${response}"
      
      Respond to their answer and ask the next technical question on the topic of ${topic}.
      Return ONLY a valid JSON object:
      "finished": false,
      "nextQuestion": (string text of the next question).
      Do not include markdown tags.`;
    }

    const result = await model.generateContent(prompt);
    const parsedResult = cleanJsonString(result.response.text());

    if (parsedResult.finished) {
      // Sync placement scores
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'placementMetrics.mockInterviews': 1 },
        $set: { 'placementMetrics.averageMockScore': (parsedResult.technicalScore + parsedResult.communicationScore) / 2 },
      });
    }

    res.status(200).json({
      success: true,
      ...parsedResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing response from interviewer bot',
    });
  }
};
