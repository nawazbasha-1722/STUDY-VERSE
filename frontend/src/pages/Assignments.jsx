import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
  FileText,
  CheckCircle,
  Upload,
  ClipboardList,
} from 'lucide-react';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Student upload state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [file, setFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Faculty create assignment state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
  });
  const [createMessage, setCreateMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Faculty grading state
  const [activeAssignGrading, setActiveAssignGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: '',
  });
  const [gradingSubmissionId, setGradingSubmissionId] = useState('');
  const [gradeLoading, setGradeLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      const response = await API.get('/assignments');
      if (response.data?.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Submit Assignment Handler
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setSubmitMessage('Error: Please select a file.');
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await API.post(`/assignments/${selectedAssignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        setSubmitMessage('Assignment submitted successfully!');
        setFile(null);
        fetchAssignments();
        setTimeout(() => setSubmitModalOpen(false), 2000);
      }
    } catch (err) {
      setSubmitMessage(err.response?.data?.message || 'Error submitting assignment');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Create Assignment Handler (Faculty)
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreateMessage('');
    setCreateLoading(true);

    try {
      const res = await API.post('/assignments', createForm);
      if (res.data?.success) {
        setCreateMessage('Assignment task created successfully!');
        setCreateForm({ title: '', description: '', subject: '', dueDate: '' });
        fetchAssignments();
      }
    } catch (err) {
      setCreateMessage(err.response?.data?.message || 'Error creating assignment');
    } finally {
      setCreateLoading(false);
    }
  };

  // Grade Submission Handler (Faculty)
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setGradeLoading(true);

    try {
      const res = await API.post(
        `/assignments/${activeAssignGrading._id}/grade/${gradingSubmissionId}`,
        gradeForm
      );
      if (res.data?.success) {
        // Refresh grading list
        const updated = assignments.map((a) => {
          if (a.id === activeAssignGrading._id) {
            const subs = a.submissions.map((s) => (s._id === gradingSubmissionId ? res.data.submission : s));
            return { ...a, submissions: subs };
          }
          return a;
        });
        setAssignments(updated);
        // Find updated active assignment object
        const activeItem = updated.find((a) => a.id === activeAssignGrading._id);
        setActiveAssignGrading(activeItem);
        setGradingSubmissionId('');
        setGradeForm({ grade: '', feedback: '' });
      }
    } catch (err) {
      console.error('Error grading submission', err);
    } finally {
      setGradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Assignment Space</h1>
        <p className="text-gray-400 text-sm mt-1">
          {user?.role === 'student'
            ? 'Track deadlines, upload files, and view faculty feedback logs.'
            : 'Post curriculum assignments and grade submissions.'}
        </p>
      </div>

      {user?.role === 'student' ? (
        /* Student Screen */
        <div className="grid grid-cols-1 gap-6">
          {assignments.length === 0 ? (
            <div className="text-center py-20 bg-[#0f1424] border border-white/5 rounded-3xl">
              <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Assignments Yet</h3>
              <p className="text-gray-400 text-sm">Your faculty has not posted any tasks yet.</p>
            </div>
          ) : (
            assignments.map((assign) => {
              const isOverdue = assign.status === 'Overdue';
              const isSubmitted = assign.status.startsWith('Submit') || assign.status.startsWith('Late');
              return (
                <div
                  key={assign.id}
                  className="bg-[#0f1424] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {assign.subject}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSubmitted
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : isOverdue
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                            : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {assign.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{assign.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {assign.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Due Date: {new Date(assign.dueDate).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Submission actions & feedback */}
                  <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3 shrink-0">
                    {isSubmitted ? (
                      <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl space-y-2 text-xs w-full min-w-[200px]">
                        <p className="text-gray-400">
                          Submitted: {new Date(assign.submissionDetails.submittedAt).toLocaleDateString()}
                        </p>
                        {assign.submissionDetails.grade ? (
                          <div className="pt-2 border-t border-white/5 space-y-1">
                            <p className="font-bold text-purple-400">Grade: {assign.submissionDetails.grade}</p>
                            {assign.submissionDetails.feedback && (
                              <p className="text-gray-500 italic">Feedback: "{assign.submissionDetails.feedback}"</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic pt-1">Awaiting evaluation</p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAssignmentId(assign.id);
                          setSubmitModalOpen(true);
                          setSubmitMessage('');
                          setFile(null);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/10"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Submit Work</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Faculty View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Creation Form */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5.5 h-5.5 text-purple-400" />
              <span>Create Assignment Task</span>
            </h3>

            {createMessage && (
              <div
                className={`px-4 py-3 rounded-xl text-sm ${
                  createMessage.startsWith('Error')
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-green-500/10 border border-green-500/20 text-green-400'
                }`}
              >
                {createMessage}
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS Homework 2"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-2">Description</label>
                <textarea
                  placeholder="Notes, instructions..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows="3"
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DBMS"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {createLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Publish Task</span>
                )}
              </button>
            </form>
          </div>

          {/* Assignments list & submissions log */}
          <div className="lg:col-span-2 space-y-6">
            {activeAssignGrading ? (
              /* Grading Portal view for specific assignment */
              <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Submissions: {activeAssignGrading.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Subject: {activeAssignGrading.subject}</p>
                  </div>
                  <button
                    onClick={() => setActiveAssignGrading(null)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    Back to Assignments
                  </button>
                </div>

                {activeAssignGrading.submissions.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-12">No student submissions recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {activeAssignGrading.submissions.map((sub) => {
                      const isGraded = sub.grade;
                      return (
                        <div
                          key={sub._id}
                          className="bg-[#161b30] border border-white/5 p-5 rounded-2xl flex flex-col gap-4"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <div>
                              <p className="font-semibold text-white">Student: {sub.student?.name || 'Academic'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Submitted: {new Date(sub.submittedAt).toLocaleString()} ({sub.status})
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                // Resolve path and open
                                const baseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                const rootUrl = baseApi.replace('/api', '');
                                window.open(`${rootUrl}${sub.fileUrl}`, '_blank');
                              }}
                              className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View File</span>
                            </button>
                          </div>

                          {/* Grading Form or Score view */}
                          {isGraded ? (
                            <div className="bg-[#0d1222] p-3 rounded-xl text-xs space-y-1">
                              <p className="font-bold text-green-400">Score Registered: {sub.grade}</p>
                              {sub.feedback && <p className="text-gray-400 italic">Feedback: "{sub.feedback}"</p>}
                            </div>
                          ) : (
                            <form
                              onSubmit={(e) => {
                                setGradingSubmissionId(sub._id);
                                handleGradeSubmission(e);
                              }}
                              className="flex flex-wrap gap-3 items-end pt-2 border-t border-white/5 text-xs"
                            >
                              <div>
                                <label className="block text-gray-400 font-medium mb-1">Grade</label>
                                <input
                                  type="text"
                                  placeholder="e.g. A+, O, 90"
                                  required
                                  value={gradingSubmissionId === sub._id ? gradeForm.grade : ''}
                                  onChange={(e) => {
                                    setGradingSubmissionId(sub._id);
                                    setGradeForm({ ...gradeForm, grade: e.target.value });
                                  }}
                                  className="bg-[#0d1222] border border-white/5 rounded-xl px-3 py-2 text-white max-w-[100px]"
                                />
                              </div>
                              <div className="flex-1 min-w-[200px]">
                                <label className="block text-gray-400 font-medium mb-1">Feedback</label>
                                <input
                                  type="text"
                                  placeholder="Comments..."
                                  value={gradingSubmissionId === sub._id ? gradeForm.feedback : ''}
                                  onChange={(e) => {
                                    setGradingSubmissionId(sub._id);
                                    setGradeForm({ ...gradeForm, feedback: e.target.value });
                                  }}
                                  className="w-full bg-[#0d1222] border border-white/5 rounded-xl px-3 py-2 text-white"
                                />
                              </div>
                              <button
                                type="submit"
                                className="bg-[#aa3bff] hover:bg-[#b854ff] text-white px-4 py-2 rounded-xl font-semibold cursor-pointer shrink-0"
                              >
                                Submit Grade
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Faculty general assignments tracker */
              <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Published Course Assignments</h3>

                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-12">No published assignments.</p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assign) => (
                      <div
                        key={assign.id}
                        className="bg-[#161b30] border border-white/5 p-5 rounded-2xl flex justify-between items-center gap-4 hover:border-purple-500/10 transition-all"
                      >
                        <div className="space-y-1">
                          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {assign.subject}
                          </span>
                          <h4 className="font-semibold text-white pt-1">{assign.title}</h4>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(assign.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            // Format student lookup records if available in submission records
                            // We need to fetch/populate student profile fields in submissions.
                            // To keep it simple, we can load active assignment into state
                            setActiveAssignGrading(assign);
                          }}
                          className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                          <span>View Submissions ({assign.submissions?.length || 0})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Submit Modal Drawer */}
      <AnimatePresence>
        {submitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSubmitModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1424] border border-white/5 rounded-3xl p-8 max-w-md w-full z-10 space-y-6 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5.5 h-5.5 text-purple-400" />
                <span>Submit Assignment Work</span>
              </h2>

              {submitMessage && (
                <div
                  className={`px-4 py-3 rounded-xl text-sm ${
                    submitMessage.startsWith('Error')
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                      : 'bg-green-500/10 border border-green-500/20 text-green-400'
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Upload File Submission
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={(e) => setFile(e.target.files[0])}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      id="assign-file-upload"
                    />
                    <label
                      htmlFor="assign-file-upload"
                      className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-4 text-gray-400 text-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#1e2444] transition-colors border-dashed border-2 border-white/10"
                    >
                      <Upload className="w-6 h-6 text-purple-400" />
                      <span className="truncate max-w-[250px] font-medium">
                        {file ? file.name : 'Select work document (PDF, DOCX)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 px-6 rounded-xl text-white font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {submitLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Upload Work</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Assignments;
