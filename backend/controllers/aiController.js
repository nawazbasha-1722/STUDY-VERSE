import { extractTextFromFile } from '../services/textExtractor.js';
import {
  summarizeText,
  askQuestionAboutText,
  generateFlashcards,
  generateQuizzes,
} from '../services/aiService.js';
import fs from 'fs';

// @desc    Upload file and generate study aids
// @route   POST /api/ai/analyze-file
// @access  Private (Student)
export const analyzeFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a PDF or DOCX file to analyze',
    });
  }

  try {
    const textContent = await extractTextFromFile(req.file.path, req.file.originalname);

    // Delete temp file after extraction
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkErr) {
      console.error('Failed to unlink temp file:', unlinkErr);
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No readable text content found in the uploaded file',
      });
    }

    // Run AI generators in parallel
    const [summary, flashcards, quizzes] = await Promise.all([
      summarizeText(textContent),
      generateFlashcards(textContent),
      generateQuizzes(textContent),
    ]);

    res.status(200).json({
      success: true,
      message: 'File analyzed successfully!',
      textContext: textContent, // return context so client can pass it back for Q&A
      summary,
      flashcards,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error analyzing document',
    });
  }
};

// @desc    Q&A against analyzed document context
// @route   POST /api/ai/ask
// @access  Private (Student)
export const askQuestion = async (req, res) => {
  const { textContext, question } = req.body;

  if (!textContext || !question) {
    return res.status(400).json({
      success: false,
      message: 'Please provide document text context and a question',
    });
  }

  try {
    const answer = await askQuestionAboutText(textContext, question);

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error answering question',
    });
  }
};
