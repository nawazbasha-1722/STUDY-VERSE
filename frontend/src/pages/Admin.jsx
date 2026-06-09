import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Trophy,
  Activity,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Admin = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const response = await API.get('/admin/analytics');
      if (response.data?.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unauthorized access to admin panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAnalytics();
    } else {
      setError('Unauthorized access. Admin role required.');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-bold text-white">Access Denied</h3>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  // Bar chart stats
  const placementChartData = [
    { name: 'Coding Solved', val: analytics.placement?.codingSolvedAvg || 0 },
    { name: 'Aptitude Solved', val: analytics.placement?.aptitudeSolvedAvg || 0 },
    { name: 'Mock Interviews', val: analytics.placement?.mockInterviewsAvg || 0 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-8 h-8 text-purple-400" />
          <span>Admin Diagnostics Dashboard</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Monitor system usage, resource statistics, and user registration ratios.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold">
              ERP Registered
            </span>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{analytics.users?.total || 0}</p>
          <p className="text-sm text-gray-400 font-medium">Total Platform Users</p>
        </motion.div>

        {/* Notes uploaded */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
              Study Hub
            </span>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{analytics.notes?.totalNotes || 0}</p>
          <p className="text-sm text-gray-400 font-medium">Uploaded Notes Files</p>
        </motion.div>

        {/* Note downloads */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-semibold">
              Engagement
            </span>
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{analytics.notes?.totalDownloads || 0}</p>
          <p className="text-sm text-gray-400 font-medium">Notes File Downloads</p>
        </motion.div>

        {/* CGPA average */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full font-semibold">
              Academic Ratio
            </span>
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{analytics.academic?.averageCgpa || 0}</p>
          <p className="text-sm text-gray-400 font-medium">Student Avg CGPA</p>
        </motion.div>
      </div>

      {/* Analytics Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Placement readiness chart */}
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white">Student Placement Indicators</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b30',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="val" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Distribution */}
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">User Role Ratios</h3>
          <div className="space-y-4">
            {/* Student */}
            <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                <span className="text-white font-medium">Students</span>
              </div>
              <span className="text-gray-400 font-semibold">{analytics.users?.students || 0}</span>
            </div>

            {/* Faculty */}
            <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                <span className="text-white font-medium">Faculty Members</span>
              </div>
              <span className="text-gray-400 font-semibold">{analytics.users?.faculties || 0}</span>
            </div>

            {/* Admin */}
            <div className="bg-[#161b30] border border-white/5 p-4 rounded-2xl flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-white font-medium">Administrators</span>
              </div>
              <span className="text-gray-400 font-semibold">{analytics.users?.admins || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
