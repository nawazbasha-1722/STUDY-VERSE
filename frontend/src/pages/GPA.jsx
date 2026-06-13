import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Trash2,
  Save,
  LineChart,
  Calculator,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const GRADE_VALUES = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

const GPA = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [previousCgpa, setPreviousCgpa] = useState('');
  const [previousCredits, setPreviousCredits] = useState('');
  const [baselineSaving, setBaselineSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Logging mode toggle
  const [isDirectSGPA, setIsDirectSGPA] = useState(false);
  const [directSgpa, setDirectSgpa] = useState('');
  const [directCredits, setDirectCredits] = useState('');

  // Semester Builder state
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [courses, setCourses] = useState([
    { courseCode: '', courseName: '', credits: 4, grade: 'O' },
  ]);

  const fetchGPAHistory = async () => {
    try {
      const response = await API.get('/gpa/history');
      if (response.data?.success) {
        setHistory(response.data.records || []);
        setCgpa(response.data.cgpa || 0);
        setPreviousCgpa(response.data.previousCgpa !== undefined ? response.data.previousCgpa : '');
        setPreviousCredits(response.data.previousCredits !== undefined ? response.data.previousCredits : '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch GPA history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGPAHistory();
  }, []);

  // Add course item
  const addCourseRow = () => {
    setCourses([...courses, { courseCode: '', courseName: '', credits: 3, grade: 'O' }]);
  };

  // Remove course item
  const removeCourseRow = (index) => {
    const updated = [...courses];
    updated.splice(index, 1);
    setCourses(updated);
  };

  // Handle row changes
  const handleCourseChange = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  // Calculate live SGPA locally
  const calculateLiveSGPA = () => {
    if (isDirectSGPA) {
      return Number(directSgpa) ? Number(directSgpa).toFixed(2) : '0.00';
    }
    let totalCredits = 0;
    let earnedPoints = 0;
    courses.forEach((c) => {
      const credits = Number(c.credits) || 0;
      const points = GRADE_VALUES[c.grade] || 0;
      totalCredits += credits;
      earnedPoints += points * credits;
    });
    return totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : '0.00';
  };

  // Save Baseline details
  const handleSaveBaseline = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBaselineSaving(true);

    try {
      const response = await API.post('/gpa/baseline', {
        previousCgpa: Number(previousCgpa) || 0,
        previousCredits: Number(previousCredits) || 0,
      });

      if (response.data?.success) {
        setSuccess('Baseline GPA and credits updated successfully!');
        fetchGPAHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update baseline GPA');
    } finally {
      setBaselineSaving(false);
    }
  };

  // Submit Semester Record
  const handleSubmitSemester = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        semester: Number(selectedSemester),
        isDirectSGPA,
      };

      if (isDirectSGPA) {
        payload.sgpa = Number(directSgpa);
        payload.totalCredits = Number(directCredits);
      } else {
        payload.courses = courses;
      }

      const response = await API.post('/gpa/semester', payload);

      if (response.data?.success) {
        setSuccess(`Semester ${selectedSemester} logged! SGPA: ${response.data.record.sgpa}`);
        // Reset inputs
        setCourses([{ courseCode: '', courseName: '', credits: 4, grade: 'O' }]);
        setDirectSgpa('');
        setDirectCredits('');
        fetchGPAHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log semester details');
    } finally {
      setSaving(false);
    }
  };

  const chartData = history.map((h) => ({
    name: `Sem ${h.semester}`,
    sgpa: h.sgpa,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GPA Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">
            Calculate your semester SGPA and track your overall CGPA progress curves.
          </p>
        </div>
        <div className="bg-[#0f1424] border border-white/5 px-6 py-4 rounded-3xl flex items-center gap-4 shrink-0 shadow-lg">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white leading-tight">{cgpa.toFixed(2)}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cumulative CGPA</p>
          </div>
        </div>
      </div>

      {/* History and Trends */}
      {chartData.length > 0 && (
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <LineChart className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Academic Performance Graph</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 10]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b30',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="sgpa" stroke="#aa3bff" strokeWidth={3} activeDot={{ r: 6 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Calculator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Semester Form builder */}
        <div className="lg:col-span-2 bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Log Semester Grades</h2>
            </div>
            
            {/* Toggle between logging modes */}
            <div className="flex bg-[#161b30] border border-white/5 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setIsDirectSGPA(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isDirectSGPA
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                By Subjects
              </button>
              <button
                type="button"
                onClick={() => setIsDirectSGPA(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isDirectSGPA
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Direct SGPA
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmitSemester} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Select Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    Semester {num}
                  </option>
                ))}
              </select>
            </div>

            {!isDirectSGPA ? (
              /* Courses Rows (By Subjects) */
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-3 text-xs text-gray-500 font-bold uppercase tracking-wider pl-2">
                  <div className="col-span-3">Code</div>
                  <div className="col-span-5">Course Name</div>
                  <div className="col-span-2">Credits</div>
                  <div className="col-span-2">Grade</div>
                </div>

                <AnimatePresence initial={false}>
                  {courses.map((course, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="CS301"
                          required
                          value={course.courseCode}
                          onChange={(e) => handleCourseChange(idx, 'courseCode', e.target.value)}
                          className="w-full bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="DBMS"
                          required
                          value={course.courseName}
                          onChange={(e) => handleCourseChange(idx, 'courseName', e.target.value)}
                          className="w-full bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={course.credits}
                          onChange={(e) => handleCourseChange(idx, 'credits', Number(e.target.value))}
                          className="w-full bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none appearance-none"
                        >
                          {[1, 2, 3, 4, 5].map((credit) => (
                            <option key={credit} value={credit}>
                              {credit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <select
                          value={course.grade}
                          onChange={(e) => handleCourseChange(idx, 'grade', e.target.value)}
                          className="w-full bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none appearance-none"
                        >
                          {Object.keys(GRADE_VALUES).map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        {courses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCourseRow(idx)}
                            className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Direct SGPA Input */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Semester SGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    placeholder="8.25"
                    value={directSgpa}
                    onChange={(e) => setDirectSgpa(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Total Semester Credits</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="20"
                    value={directCredits}
                    onChange={(e) => setDirectCredits(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5 justify-between items-center">
              {!isDirectSGPA ? (
                <button
                  type="button"
                  onClick={addCourseRow}
                  className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 text-sm text-gray-300 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Course</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    {isDirectSGPA ? 'Logged SGPA' : 'Est. SGPA'}
                  </p>
                  <p className="text-lg font-bold text-white">{calculateLiveSGPA()}</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer text-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Widgets (Baseline & Logs) */}
        <div className="space-y-6">
          {/* Baseline GPA settings */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Baseline (Prior Semesters)</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              Enter your baseline CGPA and total credits from previous semesters to baseline your overall CGPA calculation.
            </p>
            <form onSubmit={handleSaveBaseline} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Prior CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="8.50"
                    value={previousCgpa}
                    onChange={(e) => setPreviousCgpa(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Prior Credits</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="60"
                    value={previousCredits}
                    onChange={(e) => setPreviousCredits(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={baselineSaving}
                className="w-full bg-[#161b30] hover:bg-[#1e2444] border border-white/5 text-sm text-gray-300 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {baselineSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Baseline</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Log view */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6 h-fit">
            <h3 className="text-lg font-bold text-white">Semester Summary Logs</h3>

            {history.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-6">No semesters logged yet.</p>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div
                    key={record._id}
                    className="bg-[#161b30] border border-white/5 p-4.5 rounded-2xl flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-white">Semester {record.semester}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 font-normal">
                        {record.isDirectSGPA
                          ? `${record.totalCredits || 0} Credits (Direct Entry)`
                          : `${record.courses?.length || 0} Courses logged`
                        }
                      </p>
                    </div>
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-3 py-1.5 rounded-xl text-sm">
                      {record.sgpa.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPA;
