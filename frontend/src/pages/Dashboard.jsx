import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  GraduationCap,
  ClipboardList,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock analytics history
  const performanceData = [
    { name: 'Sem 1', gpa: 8.2 },
    { name: 'Sem 2', gpa: 8.5 },
    { name: 'Sem 3', gpa: 8.9 },
    { name: 'Sem 4', gpa: 9.1 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Hey, {user?.name || 'Academic'}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here's what's happening with your academic progress today.
          </p>
        </div>
        <div className="bg-[#161b30] border border-white/5 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm text-gray-300">
          <Calendar className="w-4.5 h-4.5 text-purple-400" />
          <span>June 9, 2026</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-medium">
              Good Stand
            </span>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">82.4%</p>
          <p className="text-sm text-gray-400 font-medium">Average Attendance</p>
        </motion.div>

        {/* GPA */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium">
              Top 10%
            </span>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">9.1</p>
          <p className="text-sm text-gray-400 font-medium">Cumulative CGPA</p>
        </motion.div>

        {/* Tasks */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full font-medium">
              3 Pending
            </span>
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">4/7 Tasks</p>
          <p className="text-sm text-gray-400 font-medium">Assignments Done</p>
        </motion.div>

        {/* Study Streak */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
              Daily Goal
            </span>
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">5 Days</p>
          <p className="text-sm text-gray-400 font-medium">Study Streak</p>
        </motion.div>
      </div>

      {/* Analytics & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Card */}
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">GPA Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Semester-wise grade improvements</p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="gpa" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI & Countdown Card */}
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Smart Reminders</h3>

          <div className="space-y-4">
            {/* Quick AI Assistant Card */}
            <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl flex gap-3.5 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">AI Note Analysis</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  Upload a PDF class document, extract major concepts, and formulate quiz sheets.
                </p>
              </div>
            </div>

            {/* Upcoming Exam Card */}
            <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl flex gap-3.5 items-center">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Database Management Midterm</p>
                <p className="text-xs text-red-400 mt-0.5 font-medium">In 2 days (June 11)</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#161b30] hover:bg-[#1f2644] text-white py-3 rounded-2xl text-sm font-medium border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <span>View All Planner Schedules</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
