import { useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  FileText,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react';

const AIAssistant = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // AI Generated Results
  const [aiData, setAiData] = useState(null); // { textContext, summary, flashcards, quizzes }
  const [activeTab, setActiveTab] = useState('summary'); // summary, chat, flashcards, quiz

  // Chat/Q&A states
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Flashcards state
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIdx: optionIdx }
  const [quizScore, setQuizScore] = useState(null);

  // Handle File Upload & Analysis
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setAnalyzing(true);
    setError('');
    setAiData(null);
    setChatHistory([]);
    setQuizAnswers({});
    setQuizScore(null);
    setActiveCardIdx(0);
    setFlipped(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await API.post('/ai/analyze-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        setAiData(response.data);
        // Pre-populate chat with welcoming message
        setChatHistory([
          {
            sender: 'bot',
            text: "Hello! I've analyzed your document. Ask me any questions, and I will search the text context to provide explanations!",
          },
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze the document. Ensure it contains readable text.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle Chat submit
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question || !aiData?.textContext) return;

    const userMsg = question;
    setQuestion('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await API.post('/ai/ask', {
        textContext: aiData.textContext,
        question: userMsg,
      });

      if (response.data?.success) {
        setChatHistory((prev) => [...prev, { sender: 'bot', text: response.data.answer }]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an error answering your question. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Quiz selection
  const handleSelectOption = (qIdx, optIdx) => {
    if (quizScore !== null) return; // quiz completed, lock answers
    setQuizAnswers({
      ...quizAnswers,
      [qIdx]: optIdx,
    });
  };

  // Submit Quiz evaluation
  const handleEvaluateQuiz = () => {
    if (!aiData?.quizzes) return;

    let score = 0;
    aiData.quizzes.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });

    setQuizScore({
      score,
      total: aiData.quizzes.length,
    });
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizScore(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span>AI Study Workspace</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Upload course PDF / Word guides to unlock custom summarizations, Q&As, flashcard tables, and revision MCQs.
          </p>
        </div>
      </div>

      {/* File Upload Dropzone card */}
      {!aiData && (
        <div className="max-w-2xl mx-auto bg-[#0f1424] border border-white/5 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Upload Study Guide</h3>
            <p className="text-sm text-gray-400 mt-1">Supported file types: PDF, DOCX (Max 30MB)</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm max-w-md mx-auto">
              {error}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="relative">
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files[0])}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                id="study-file-uploader"
              />
              <label
                htmlFor="study-file-uploader"
                className="w-full bg-[#161b30] border border-white/5 rounded-2xl px-4 py-4 text-gray-400 text-sm flex items-center justify-between cursor-pointer hover:bg-[#1e2444] transition-colors"
              >
                <span className="truncate max-w-[280px] font-medium">
                  {file ? file.name : 'Select file document'}
                </span>
                <FileText className="w-5 h-5 text-purple-400 shrink-0" />
              </label>
            </div>

            <button
              type="submit"
              disabled={analyzing || !file}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-2xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Context...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Process Document</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* AI Hub workspace */}
      {aiData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar tabs */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-5 h-fit flex flex-row lg:flex-col gap-2 overflow-x-auto">
            {[
              { id: 'summary', name: 'Study Summary', icon: FileText },
              { id: 'chat', name: 'Concept Tutor', icon: MessageSquare },
              { id: 'flashcards', name: 'Flashcards', icon: BookOpen },
              { id: 'quiz', name: 'Revision Quiz', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full text-left shrink-0 ${
                    active
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}

            <button
              onClick={() => setAiData(null)}
              className="text-xs text-red-400 hover:underline px-4 py-3 text-left w-full mt-2"
            >
              Analyze another file
            </button>
          </div>

          {/* Main workspace panels */}
          <div className="lg:col-span-3 bg-[#0f1424] border border-white/5 rounded-3xl p-6 min-h-[500px] flex flex-col shadow-2xl relative">
            {/* 1. Summary Panel */}
            {activeTab === 'summary' && (
              <div className="space-y-6 flex-1">
                <h2 className="text-xl font-bold text-white">Study Summary</h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                  {/* Summary generally contains markdown from AI */}
                  <div className="whitespace-pre-line bg-[#161b30] border border-white/5 p-6 rounded-2xl">
                    {aiData.summary}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Concept Tutor / Chat Panel */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[500px] justify-between">
                <h2 className="text-xl font-bold text-white mb-4">Concept Tutor</h2>

                {/* Messages scroll content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-[#161b30] text-gray-200 border border-white/5 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#161b30] text-gray-400 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span>AI is writing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input action */}
                <form onSubmit={handleAskQuestion} className="flex gap-3 pt-4 border-t border-white/5">
                  <input
                    type="text"
                    required
                    placeholder="Ask a question about the study document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 bg-[#161b30] border border-white/5 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3.5 rounded-2xl transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}

            {/* 3. Flashcards Panel */}
            {activeTab === 'flashcards' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Interactive Flashcards</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Click on the card to flip and reveal details.</p>
                </div>

                {aiData.flashcards?.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No flashcards generated.</p>
                ) : (
                  <div className="flex flex-col items-center gap-8 justify-center my-auto">
                    {/* Flippable Card Container */}
                    <div
                      onClick={() => setFlipped(!flipped)}
                      className="w-full max-w-md h-60 cursor-pointer perspective"
                    >
                      <motion.div
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="w-full h-full relative preserve-3d"
                      >
                        {/* Front Side */}
                        <div className="absolute inset-0 bg-[#161b30] border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center text-center backface-hidden shadow-xl">
                          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-4">Term</p>
                          <h3 className="text-xl font-bold text-white">{aiData.flashcards[activeCardIdx]?.front}</h3>
                        </div>

                        {/* Back Side */}
                        <div
                          className="absolute inset-0 bg-purple-650 border border-purple-500/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center backface-hidden shadow-xl"
                          style={{ transform: 'rotateY(180deg)', backgroundColor: '#2e1c52' }}
                        >
                          <p className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-4">Definition</p>
                          <p className="text-sm text-gray-200 leading-relaxed">
                            {aiData.flashcards[activeCardIdx]?.back}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => {
                          setFlipped(false);
                          setActiveCardIdx((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={activeCardIdx === 0}
                        className="px-4 py-2 bg-[#161b30] hover:bg-[#1e2444] rounded-xl text-xs text-gray-400 font-semibold border border-white/5 cursor-pointer disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-sm text-gray-400">
                        {activeCardIdx + 1} / {aiData.flashcards.length}
                      </span>
                      <button
                        onClick={() => {
                          setFlipped(false);
                          setActiveCardIdx((prev) => Math.min(aiData.flashcards.length - 1, prev + 1));
                        }}
                        disabled={activeCardIdx === aiData.flashcards.length - 1}
                        className="px-4 py-2 bg-[#161b30] hover:bg-[#1e2444] rounded-xl text-xs text-gray-400 font-semibold border border-white/5 cursor-pointer disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Quiz Panel */}
            {activeTab === 'quiz' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <h2 className="text-xl font-bold text-white">Revision Quiz</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Test your document reading details.</p>
                  </div>
                  {quizScore && (
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-3 py-1.5 rounded-xl text-xs">
                      Score: {quizScore.score} / {quizScore.total}
                    </span>
                  )}
                </div>

                {aiData.quizzes?.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No quiz questions generated.</p>
                ) : (
                  <div className="space-y-8 flex-1 overflow-y-auto max-h-[400px] pr-2">
                    {aiData.quizzes.map((quiz, qIdx) => {
                      const selectedOpt = quizAnswers[qIdx];
                      const isEvaluated = quizScore !== null;
                      return (
                        <div key={qIdx} className="space-y-4">
                          <h4 className="font-semibold text-white text-sm flex gap-2">
                            <span className="text-purple-400 font-bold">{qIdx + 1}.</span>
                            <span>{quiz.question}</span>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                            {quiz.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              const isCorrect = quiz.correctAnswer === optIdx;

                              let btnStyle = 'bg-[#161b30] border-white/5 text-gray-300';
                              if (isSelected) {
                                btnStyle = 'bg-purple-600/10 border-purple-500 text-purple-400 font-medium';
                              }

                              if (isEvaluated) {
                                if (isCorrect) {
                                  btnStyle = 'bg-green-500/10 border-green-500 text-green-400 font-semibold';
                                } else if (isSelected) {
                                  btnStyle = 'bg-red-500/10 border-red-500 text-red-400 font-semibold';
                                } else {
                                  btnStyle = 'bg-[#161b30]/50 border-white/5 text-gray-500';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectOption(qIdx, optIdx)}
                                  className={`px-4 py-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation summary */}
                          {isEvaluated && (
                            <div className="bg-[#161b30] p-4 rounded-2xl border border-white/5 text-xs text-gray-400 leading-relaxed ml-4">
                              <span className="font-bold text-white block mb-1">Explanation:</span>
                              {quiz.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
                  {quizScore === null ? (
                    <button
                      onClick={handleEvaluateQuiz}
                      disabled={Object.keys(quizAnswers).length !== aiData.quizzes.length}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-purple-600/10"
                    >
                      Evaluate Quiz Answers
                    </button>
                  ) : (
                    <button
                      onClick={handleResetQuiz}
                      className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 text-gray-300 font-semibold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer"
                    >
                      Reset and Retry
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
