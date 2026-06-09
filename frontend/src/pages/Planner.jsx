import { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  Loader2,
  Award,
  BookOpen,
} from 'lucide-react';

const Planner = () => {
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New goal state
  const [goalText, setGoalText] = useState('');
  const [goalType, setGoalType] = useState('daily');
  const [goalLoading, setGoalLoading] = useState(false);

  // New countdown state
  const [cdTitle, setCdTitle] = useState('');
  const [cdDate, setCdDate] = useState('');
  const [cdLoading, setCdLoading] = useState(false);

  // Study logger state
  const [logSubject, setLogSubject] = useState('');
  const [logDuration, setLogDuration] = useState(30);
  const [logLoading, setLogLoading] = useState(false);

  const fetchPlanner = async () => {
    try {
      const response = await API.get('/planner');
      if (response.data?.success) {
        setPlanner(response.data.planner);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load planner hub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  // Add Goal Checklist Item
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalText) return;
    setGoalLoading(true);

    try {
      const res = await API.post('/planner/goals', { text: goalText, type: goalType });
      if (res.data?.success) {
        setPlanner({ ...planner, goals: res.data.goals });
        setGoalText('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add goal');
    } finally {
      setGoalLoading(false);
    }
  };

  // Toggle Goal Item Checked status
  const handleToggleGoal = async (goalId) => {
    try {
      const res = await API.put(`/planner/goals/${goalId}`);
      if (res.data?.success) {
        setPlanner({ ...planner, goals: res.data.goals });
      }
    } catch (err) {
      console.error('Error toggling goal status', err);
    }
  };

  // Delete Goal Item
  const handleDeleteGoal = async (goalId) => {
    try {
      const res = await API.delete(`/planner/goals/${goalId}`);
      if (res.data?.success) {
        setPlanner({ ...planner, goals: res.data.goals });
      }
    } catch (err) {
      console.error('Error deleting goal', err);
    }
  };

  // Add Countdown Target
  const handleAddCountdown = async (e) => {
    e.preventDefault();
    if (!cdTitle || !cdDate) return;
    setCdLoading(true);

    try {
      const res = await API.post('/planner/countdowns', { title: cdTitle, targetDate: cdDate });
      if (res.data?.success) {
        setPlanner({ ...planner, countdowns: res.data.countdowns });
        setCdTitle('');
        setCdDate('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add countdown');
    } finally {
      setCdLoading(false);
    }
  };

  // Delete Countdown
  const handleDeleteCountdown = async (cdId) => {
    try {
      const res = await API.delete(`/planner/countdowns/${cdId}`);
      if (res.data?.success) {
        setPlanner({ ...planner, countdowns: res.data.countdowns });
      }
    } catch (err) {
      console.error('Error deleting countdown', err);
    }
  };

  // Log Study Duration time
  const handleLogStudyTime = async (e) => {
    e.preventDefault();
    if (!logSubject || !logDuration) return;
    setLogLoading(true);

    try {
      const res = await API.post('/planner/logs', { subject: logSubject, duration: Number(logDuration) });
      if (res.data?.success) {
        setPlanner({ ...planner, studyLogs: res.data.studyLogs });
        setLogSubject('');
        setLogDuration(30);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log study time');
    } finally {
      setLogLoading(false);
    }
  };

  // Helper: calculate days remaining for countdowns
  const getDaysRemaining = (targetDate) => {
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Due today/passed';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Group goals
  const goalsByType = {
    daily: planner?.goals?.filter((g) => g.type === 'daily') || [],
    weekly: planner?.goals?.filter((g) => g.type === 'weekly') || [],
    monthly: planner?.goals?.filter((g) => g.type === 'monthly') || [],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Study Planner</h1>
        <p className="text-gray-400 text-sm mt-1">
          Coordinate your checklists, record target countdown events, and audit study session hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Checklist */}
        <div className="lg:col-span-2 bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5.5 h-5.5 text-purple-400" />
              <span>Goal Checklists</span>
            </h2>
          </div>

          {/* Add Goal Form inline */}
          <form onSubmit={handleAddGoal} className="flex gap-3">
            <input
              type="text"
              required
              placeholder="e.g. Complete CN Module 2 revision..."
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              className="flex-1 bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
            />
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="bg-[#161b30] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              type="submit"
              disabled={goalLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0"
            >
              {goalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </form>

          {/* Goals render sections */}
          {['daily', 'weekly', 'monthly'].map((type) => {
            const list = goalsByType[type];
            return (
              <div key={type} className="space-y-3 pt-2">
                <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider pl-1 capitalize">
                  {type} Goals
                </h3>

                {list.length === 0 ? (
                  <p className="text-gray-600 text-xs italic pl-1">No goals set for this category.</p>
                ) : (
                  <div className="space-y-2">
                    {list.map((goal) => (
                      <div
                        key={goal._id}
                        className="bg-[#161b30] border border-white/5 p-4.5 rounded-2xl flex justify-between items-center group"
                      >
                        <button
                          onClick={() => handleToggleGoal(goal._id)}
                          className="flex items-center gap-3.5 text-sm text-left font-medium text-white"
                        >
                          {goal.completed ? (
                            <CheckSquare className="w-5 h-5 text-purple-400 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500 shrink-0" />
                          )}
                          <span className={goal.completed ? 'line-through text-gray-500' : ''}>
                            {goal.text}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Side Panel: Countdowns & Study Time logs */}
        <div className="space-y-6">
          {/* Exam Countdown */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5.5 h-5.5 text-purple-400" />
              <span>Exam Countdown</span>
            </h3>

            {/* Add Countdown Form */}
            <form onSubmit={handleAddCountdown} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Countdown Title (e.g. DBMS Exam)"
                value={cdTitle}
                onChange={(e) => setCdTitle(e.target.value)}
                className="w-full bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={cdDate}
                  onChange={(e) => setCdDate(e.target.value)}
                  className="flex-1 bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={cdLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Countdown list */}
            {planner?.countdowns?.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-4">No count downs active.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {planner?.countdowns?.map((cd) => (
                  <div
                    key={cd._id}
                    className="bg-[#161b30] border border-white/5 p-4 rounded-2xl flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-semibold text-white text-sm">{cd.title}</p>
                      <p className="text-xs text-red-400 font-medium mt-0.5">
                        {getDaysRemaining(cd.targetDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCountdown(cd._id)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study Time Logger */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5.5 h-5.5 text-purple-400" />
              <span>Study Hours Logger</span>
            </h3>

            <form onSubmit={handleLogStudyTime} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Subject (e.g. OS)"
                  value={logSubject}
                  onChange={(e) => setLogSubject(e.target.value)}
                  className="flex-1 bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
                <input
                  type="number"
                  required
                  placeholder="Min"
                  min="1"
                  max="480"
                  value={logDuration}
                  onChange={(e) => setLogDuration(e.target.value)}
                  className="w-20 bg-[#161b30] border border-white/5 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={logLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                >
                  Log
                </button>
              </div>
            </form>

            {/* List study logs */}
            {planner?.studyLogs?.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-4">No hours logged yet.</p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {planner?.studyLogs
                  ?.slice()
                  .reverse()
                  .map((log) => (
                    <div
                      key={log._id}
                      className="bg-[#161b30] border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-semibold text-white">{log.subject}</span>
                      </div>
                      <span className="text-gray-400 font-medium">
                        {log.duration} mins ({new Date(log.date).toLocaleDateString()})
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

export default Planner;
