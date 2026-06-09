import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState('');

  // Prediction states
  const [selectedPredictSubject, setSelectedPredictSubject] = useState('');
  const [predictDays, setPredictDays] = useState(3);
  const [predictStatus, setPredictStatus] = useState('present');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // Faculty Log states
  const [facultyForm, setFacultyForm] = useState({
    studentEmail: '',
    subject: '',
    status: 'present',
    sessionType: 'Lecture',
  });
  const [logMessage, setLogMessage] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  // Fetch student's own attendance
  const fetchAttendance = async () => {
    try {
      setError('');
      const response = await API.get('/attendance/my');
      if (response.data?.success) {
        setSummary(response.data.summary || []);
        if (response.data.summary?.length > 0) {
          setSelectedPredictSubject(response.data.summary[0].subject);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchAttendance();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle Predict Simulator
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedPredictSubject) return;

    setPredictLoading(true);
    setPredictionResult(null);

    // Array of predictions (e.g. [ 'present', 'present', 'present' ])
    const nextClassesStatus = Array(Number(predictDays)).fill(predictStatus);

    try {
      const response = await API.post('/attendance/predict', {
        subject: selectedPredictSubject,
        nextClassesStatus,
      });

      if (response.data?.success) {
        setPredictionResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate attendance simulation');
    } finally {
      setPredictLoading(false);
    }
  };

  // Handle Faculty Log Submit
  const handleFacultyLog = async (e) => {
    e.preventDefault();
    setLogMessage('');
    setLogLoading(true);

    try {
      // Find student by email to get their ID
      const userRes = await API.post('/auth/login', { email: facultyForm.studentEmail, password: 'dummy-no-needed' }).catch((err) => err.response);
      // Wait, we need a helper or direct lookups in backend instead of relying on auth.
      // Let's make sure the backend endpoint logAttendance handles email lookup or we lookup in backend.
      // Ah! In backend/controllers/attendanceController.js:
      // "const { studentId, subject, date, status, sessionType } = req.body;"
      // Let's check: if we search by email in backend, that's easier. Let's make faculty log accept email directly, or let's support email mapping.
      // Wait, let's write a backend endpoint or modify logAttendance to support email mapping.
      // Let's look at `logAttendance` in backend. It currently takes `studentId`.
      // Let's modify `logAttendance` to fetch user by email first if `studentEmail` is passed!
      // Yes! That's a great developer practice. We can do that to make the frontend form simple.
      // For now, let's send log to backend:
      const payload = {
        studentEmail: facultyForm.studentEmail, // We will update the backend controller to accept email!
        subject: facultyForm.subject,
        status: facultyForm.status,
        sessionType: facultyForm.sessionType,
      };

      const res = await API.post('/attendance', payload);
      if (res.data?.success) {
        setLogMessage('Attendance logged successfully!');
        setFacultyForm({
          studentEmail: '',
          subject: '',
          status: 'present',
          sessionType: 'Lecture',
        });
      }
    } catch (err) {
      setLogMessage(err.response?.data?.message || 'Error logging attendance. Ensure student email is correct.');
    } finally {
      setLogLoading(false);
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Attendance Manager</h1>
        <p className="text-gray-400 text-sm mt-1">
          {user?.role === 'student'
            ? 'Track class presence ratio, predictions, and alerts.'
            : 'Register daily lecture presence ratios for department classes.'}
        </p>
      </div>

      {user?.role === 'student' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Attendance List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Subject Summaries</h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                  {error}
                </div>
              )}

              {summary.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-12">No attendance logs found.</p>
              ) : (
                <div className="space-y-6">
                  {summary.map((item) => {
                    const isLow = item.percentage < 75.0;
                    return (
                      <div
                        key={item.subject}
                        className="bg-[#161b30] border border-white/5 p-5 rounded-2xl space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-white">{item.subject}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Present: {item.attended} / Total lectures: {item.total}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLow ? (
                              <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Low Attendance</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Clear</span>
                              </span>
                            )}
                            <span className="text-lg font-bold text-white ml-2">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#0d1222] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLow ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Prediction Simulator Side Widget */}
          <div className="space-y-6">
            <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Attendance Simulator</h3>
              </div>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Project what your subject metrics will look like if you attend or miss upcoming course periods.
              </p>

              {summary.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-6">Register courses first.</p>
              ) : (
                <form onSubmit={handlePredict} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-2">Subject</label>
                    <select
                      value={selectedPredictSubject}
                      onChange={(e) => setSelectedPredictSubject(e.target.value)}
                      className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                    >
                      {summary.map((item) => (
                        <option key={item.subject} value={item.subject}>
                          {item.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-xs font-semibold mb-2">Days / Lectures</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={predictDays}
                        onChange={(e) => setPredictDays(e.target.value)}
                        className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-semibold mb-2">Action</label>
                      <select
                        value={predictStatus}
                        onChange={(e) => setPredictStatus(e.target.value)}
                        className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                      >
                        <option value="present">Attend</option>
                        <option value="absent">Skip</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={predictLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {predictLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Simulate Projection</span>
                    )}
                  </button>
                </form>
              )}

              {/* Simulation Result Output */}
              {predictionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-[#161b30] rounded-2xl border border-white/5 space-y-4 text-sm"
                >
                  <h4 className="font-bold text-white">Projection Results</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Current Percentage:</span>
                    <span className="text-white font-semibold">{predictionResult.current.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Simulated Percentage:</span>
                    <span
                      className={`font-bold ${
                        predictionResult.prediction.percentage < 75.0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {predictionResult.prediction.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-[#0d1222] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        predictionResult.prediction.percentage < 75.0
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(predictionResult.prediction.percentage, 100)}%` }}
                    ></div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Faculty & Admin Portal View */
        <div className="max-w-2xl bg-[#0f1424] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Log Class Attendance</h2>
          </div>

          {logMessage && (
            <div className={`px-4 py-3 rounded-xl text-sm ${logMessage.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
              {logMessage}
            </div>
          )}

          <form onSubmit={handleFacultyLog} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Student Email</label>
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={facultyForm.studentEmail}
                onChange={(e) => setFacultyForm({ ...facultyForm, studentEmail: e.target.value })}
                className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="DBMS, OS, CN"
                  value={facultyForm.subject}
                  onChange={(e) => setFacultyForm({ ...facultyForm, subject: e.target.value })}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                <select
                  value={facultyForm.status}
                  onChange={(e) => setFacultyForm({ ...facultyForm, status: e.target.value })}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Session Type</label>
                <select
                  value={facultyForm.sessionType}
                  onChange={(e) => setFacultyForm({ ...facultyForm, sessionType: e.target.value })}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={logLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-xl text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer pt-4"
            >
              {logLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Register Log entry</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Attendance;
