import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const hasApiKey = apiKey && apiKey !== 'placeholder_key' && apiKey !== '';

const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

if (!hasApiKey) {
  console.log('--- GEMINI API KEY MISSING: Falling back to local offline AI simulations ---');
}

// Helper: safe JSON extraction from Gemini string response
const cleanJsonString = (str) => {
  try {
    // Remove markdown code fences if present
    let cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from AI string response:', str);
    throw new Error('AI response was not valid JSON');
  }
};

// 1. Summarize document text
export const summarizeText = async (text) => {
  if (!hasApiKey) {
    return `### Executive Study Summary\n\n- **Core Overview**: This document focuses on the primary concepts of the uploaded curriculum modules.\n- **Key Takeaway 1**: Real-world implementation details are structured to maximize student placements and learning speeds.\n- **Key Takeaway 2**: Predictive tracking models and AI tutor assistances are essential parts of modern systems.\n- **Recommendations**: Practice quiz questions regularly to test knowledge retention rates.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize the following study document in clean markdown bullet points with a header:\n\n${text.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Summarization error:', error);
    throw error;
  }
};

// 2. Q&A about text
export const askQuestionAboutText = async (text, question) => {
  if (!hasApiKey) {
    return `[Mock Response] Based on the context provided in the document: You asked: "${question}". The document notes that correct setups, role-based controls, and incremental integrations are the recommended actions.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an AI study assistant. Use the following context document to answer the user's question:\n\nContext:\n${text.substring(0, 15000)}\n\nQuestion: ${question}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Q&A error:', error);
    throw error;
  }
};

// 3. Generate Flashcards (returns JSON array)
export const generateFlashcards = async (text) => {
  if (!hasApiKey) {
    return [
      { front: 'MERN Stack', back: 'Technology stack comprised of MongoDB, Express, React, and Node.js.' },
      { front: 'JWT (JSON Web Token)', back: 'A compact, URL-safe means of representing claims to be transferred between two parties.' },
      { front: 'WebRTC', back: 'An open-source project providing web browsers with real-time communication capabilities via APIs.' },
      { front: 'Socket.io', back: 'An event-driven library for real-time web applications, enabling bi-directional communication.' },
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this text and generate a list of 4-6 key flashcards. Return ONLY a valid JSON array of objects, where each object has "front" (the question or term) and "back" (the answer or definition). Do not include any formatting other than the JSON block. Text:\n\n${text.substring(0, 10000)}`;

    const result = await model.generateContent(prompt);
    return cleanJsonString(result.response.text());
  } catch (error) {
    console.error('Gemini Flashcards error:', error);
    throw error;
  }
};

// 4. Generate Quizzes (returns JSON array)
export const generateQuizzes = async (text) => {
  if (!hasApiKey) {
    return [
      {
        question: 'Which component represents the M in the MERN stack?',
        options: ['MySQL', 'MongoDB', 'MariaDB', 'Microsoft Access'],
        correctAnswer: 1,
        explanation: 'MongoDB is the document-based database representing the M in the MERN stack.',
      },
      {
        question: 'What is the default port range for the React Vite dev server?',
        options: ['3000', '5000', '8080', '5173'],
        correctAnswer: 3,
        explanation: 'Vite defaults to starting its development server on port 5173.',
      },
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this text and generate 3-5 multiple-choice questions. Return ONLY a valid JSON array of objects, where each object contains:
    "question" (string),
    "options" (array of 4 strings),
    "correctAnswer" (number index: 0, 1, 2, or 3 representing the correct option),
    "explanation" (string explaining why it is correct).
    Do not include any formatting other than the JSON block. Text:\n\n${text.substring(0, 10000)}`;

    const result = await model.generateContent(prompt);
    return cleanJsonString(result.response.text());
  } catch (error) {
    console.error('Gemini Quiz error:', error);
    throw error;
  }
};
