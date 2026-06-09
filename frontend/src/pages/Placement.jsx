import { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Code,
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

const Placement = () => {
  const [activeTab, setActiveTab] = useState('quizzes'); // quizzes, coding, interview

  // --- Quizzes States ---
  const [quizTopic, setQuizTopic] = useState('DBMS');
  const [questions, setQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);

  // --- Coding States ---
  const [challenges, setChallenges] = useState([]);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [codeLang, setCodeLang] = useState('javascript');
  const [codeSolution, setCodeSolution] = useState('');
  const [compileLoading, setCompileLoading] = useState(false);
  const [compileResults, setCompileResults] = useState(null);

  // --- Interview States ---
  const [interviewTopic, setInterviewTopic] = useState('DBMS');
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewChat, setInterviewChat] = useState([]); // [{ role, content }]
  const [studentAnswer, setStudentAnswer] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewReport, setInterviewReport] = useState(null); // { technicalScore, communicationScore, feedback, suggestions }

  // Load coding challenges
  const fetchChallenges = async () => {
    try {
      const res = await API.get('/placement/coding');
      if (res.data?.success) {
        setChallenges(res.data.challenges || []);
        if (res.data.challenges?.length > 0) {
          setCodeSolution(res.data.challenges[0].stub.javascript);
        }
      }
    } catch (err) {
      console.error('Error fetching challenges', err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Change active challenge stub
  const handleChallengeChange = (idx) => {
    setActiveChallengeIdx(idx);
    const stub = challenges[idx]?.stub[codeLang] || '';
    setCodeSolution(stub);
    setCompileResults(null);
  };

  // Change lang stub
  const handleLangChange = (lang) => {
    setCodeLang(lang);
    const stub = challenges[activeChallengeIdx]?.stub[lang] || '';
    setCodeSolution(stub);
  };

  // Fetch Quizzes
  const fetchQuizzes = async () => {
    setQuizLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    try {
      const res = await API.get(`/placement/quizzes?topic=${quizTopic}`);
      if (res.data?.success) {
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes', err);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [quizTopic]);

  const handleQuizAnswer = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  // Evaluate coding stubs
  const handleRunCode = async () => {
    setCompileLoading(true);
    setCompileResults(null);
    try {
      const response = await API.post('/placement/coding/evaluate', {
        challengeId: challenges[activeChallengeIdx]?.id,
        code: codeSolution,
        language: codeLang,
      });
      if (response.data?.success) {
        setCompileResults(response.data);
      }
    } catch (err) {
      console.error('Code evaluation failed', err);
    } finally {
      setCompileLoading(false);
    }
  };

  // --- Start Interview ---
  const handleStartInterview = async () => {
    setInterviewLoading(true);
    setInterviewReport(null);
    setInterviewChat([]);
    try {
      const res = await API.post('/placement/interview/start', { topic: interviewTopic });
      if (res.data?.success) {
        setInterviewChat([{ role: 'assistant', content: res.data.nextQuestion }]);
        setInterviewActive(true);
      }
    } catch (err) {
      console.error('Failed to initiate interview', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  // --- Submit Interview Response ---
  const handleSendInterviewResponse = async (e) => {
    e.preventDefault();
    if (!studentAnswer) return;

    const answer = studentAnswer;
    setStudentAnswer('');
    const updatedChat = [...interviewChat, { role: 'user', content: answer }];
    setInterviewChat(updatedChat);
    setInterviewLoading(true);

    try {
      const response = await API.post('/placement/interview/respond', {
        topic: interviewTopic,
        response: answer,
        chatHistory: updatedChat,
      });

      if (response.data?.success) {
        if (response.data.finished) {
          setInterviewReport(response.data);
          setInterviewActive(false);
        } else {
          setInterviewChat((prev) => [...prev, { role: 'assistant', content: response.data.nextQuestion }]);
        }
      }
    } catch (err) {
      console.error('Interview response failure', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-purple-400" />
            <span>Placement Corner</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Build placements readiness via quizzes, mock algorithms compilers, and AI interview simulations.
          </p>
        </div>
      </div>

      {/* Main Tab Panel selectors */}
      <div className="flex border-b border-white/5 gap-6 text-sm font-semibold">
        {[
          { id: 'quizzes', name: 'Topic Quizzes', icon: HelpCircle },
          { id: 'coding', name: 'Coding Playground', icon: Code },
          { id: 'interview', name: 'AI Interview Bot', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                active
                  ? 'border-purple-500 text-purple-400 font-bold'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Area */}
      <div className="min-h-[500px]">
        {/* Tab 1: Quizzes Workspace */}
        {activeTab === 'quizzes' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Topic selectors */}
            <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-5 h-fit flex flex-row lg:flex-col gap-2 overflow-x-auto">
              {['DBMS', 'OS', 'CN', 'OOPS', 'Aptitude'].map((t) => (
                <button
                  key={t}
                  onClick={() => setQuizTopic(t)}
                  className={`w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                    quizTopic === t ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t} Questions
                </button>
              ))}
            </div>

            {/* Questions Workspace card */}
            <div className="lg:col-span-3 bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">{quizTopic} Assessment</h3>
                {quizSubmitted && (
                  <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-3 py-1.5 rounded-xl text-sm">
                    Score: {quizScore} / {questions.length}
                  </span>
                )}
              </div>

              {quizLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : questions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">No questions loaded.</p>
              ) : (
                <div className="space-y-8">
                  {questions.map((quiz, qIdx) => {
                    const selectedOpt = quizAnswers[qIdx];
                    return (
                      <div key={qIdx} className="space-y-4 text-sm">
                        <h4 className="font-semibold text-white flex gap-2">
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

                            if (quizSubmitted) {
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
                                onClick={() => handleQuizAnswer(qIdx, optIdx)}
                                className={`px-4 py-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="bg-[#161b30] p-4 rounded-2xl border border-white/5 text-xs text-gray-400 leading-relaxed ml-4">
                            <span className="font-bold text-white block mb-1">Explanation:</span>
                            {quiz.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length !== questions.length}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        Submit Assessment
                      </button>
                    ) : (
                      <button
                        onClick={fetchQuizzes}
                        className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 text-gray-300 font-semibold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4 text-purple-400" />
                        <span>Retry Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Coding Compiler Workspace */}
        {activeTab === 'coding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Challenge info Panel */}
            <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6 h-fit">
              <h3 className="text-lg font-bold text-white">Coding Challenges</h3>

              {challenges.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No coding challenges found.</p>
              ) : (
                <div className="space-y-3">
                  {challenges.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => handleChallengeChange(idx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeChallengeIdx === idx
                          ? 'bg-purple-600/10 border-purple-500 text-purple-400 font-bold'
                          : 'bg-[#161b30] border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{c.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Instructions card */}
              {challenges[activeChallengeIdx] && (
                <div className="bg-[#161b30] p-4.5 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="font-semibold text-white text-sm">Task Description:</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {challenges[activeChallengeIdx].description}
                  </p>
                </div>
              )}
            </div>

            {/* Compiler editor */}
            <div className="lg:col-span-2 bg-[#0f1424] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">Code Editor</h3>

                {/* Lang drop */}
                <select
                  value={codeLang}
                  onChange={(e) => handleLangChange(e.target.value)}
                  className="bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none shrink-0"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              {/* Code TextArea */}
              <div className="flex-1 min-h-[300px]">
                <textarea
                  value={codeSolution}
                  onChange={(e) => setCodeSolution(e.target.value)}
                  className="w-full h-full min-h-[300px] bg-[#0d1222] border border-white/5 rounded-2xl p-4 text-xs font-mono text-gray-200 focus:outline-none resize-y"
                  style={{ tabSize: 2 }}
                />
              </div>

              {/* Run Actions */}
              <div className="flex gap-4 justify-between items-center pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">Ensure the function matches parameters.</span>

                <button
                  onClick={handleRunCode}
                  disabled={compileLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  {compileLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-purple-400" />
                      <span>Run Code Compiler</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output log drawer */}
              {compileResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#161b30] rounded-2xl border border-white/5 p-4.5 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    {compileResults.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-bold text-white text-sm">
                      {compileResults.passed ? 'All Test Cases Passed!' : 'Compile Execution Fail'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {compileResults.results.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center font-mono py-1 border-b border-white/3">
                        <span className="text-gray-400">{r.testCase}</span>
                        <span className={r.status === 'Passed' ? 'text-green-400' : 'text-red-400'}>
                          {r.status} (Expected: {r.expected})
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: AI Interview bot */}
        {activeTab === 'interview' && (
          <div className="max-w-3xl mx-auto bg-[#0f1424] border border-white/5 rounded-3xl p-6 min-h-[500px] flex flex-col justify-between shadow-2xl relative">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">AI Mock Interview Bot</h3>
              <p className="text-xs text-gray-500">Undergo 3 interview question turns on a custom topic and get evaluated.</p>
            </div>

            {/* Starter interface */}
            {!interviewActive && !interviewReport && (
              <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-6">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                  <MessageSquare className="w-8 h-8" />
                </div>

                <div className="space-y-4 w-full max-w-sm">
                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-2">Select Interview Topic</label>
                    <select
                      value={interviewTopic}
                      onChange={(e) => setInterviewTopic(e.target.value)}
                      className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    >
                      <option value="DBMS">DBMS</option>
                      <option value="OS">OS</option>
                      <option value="CN">CN</option>
                      <option value="OOPS">OOPS</option>
                    </select>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    disabled={interviewLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {interviewLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Start Mock Interview</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Chat dialog panel */}
            {interviewActive && (
              <div className="flex-1 flex flex-col h-[400px] justify-between mt-6">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                  {interviewChat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-[#161b30] text-gray-200 border border-white/5 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {interviewLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#161b30] text-gray-400 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span>Interviewer is analyzing...</span>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendInterviewResponse} className="flex gap-3 pt-4 border-t border-white/5">
                  <input
                    type="text"
                    required
                    placeholder="Enter your response here..."
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    className="flex-1 bg-[#161b30] border border-white/5 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={interviewLoading}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3.5 rounded-2xl transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}

            {/* End Assessment Report Panel */}
            {interviewReport && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col justify-center space-y-6 mt-6 border-t border-white/5 pt-6 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <h4 className="font-bold text-white text-lg">Interview Evaluation Report</h4>
                </div>

                {/* Score stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-purple-400">{interviewReport.technicalScore} / 10</p>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">Technical Score</p>
                  </div>
                  <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-indigo-400">{interviewReport.communicationScore} / 10</p>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">Communication Score</p>
                  </div>
                </div>

                {/* Feedback cards */}
                <div className="space-y-4">
                  <div className="bg-[#161b30] border border-white/5 p-5 rounded-2xl space-y-2">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400">Strengths & Weaknesses</h5>
                    <p className="text-xs text-gray-400 leading-relaxed">{interviewReport.feedback}</p>
                  </div>

                  <div className="bg-[#161b30] border border-white/5 p-5 rounded-2xl space-y-2">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-400">Suggestions for improvement</h5>
                    <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{interviewReport.suggestions}</p>
                  </div>
                </div>

                <button
                  onClick={() => setInterviewReport(null)}
                  className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 text-gray-300 font-semibold py-3 rounded-2xl text-sm transition-colors cursor-pointer"
                >
                  Restart a new Interview
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Placement;
