import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { io } from 'socket.io-client';
import {
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  Calculator,
  BookOpen,
  FileCheck,
  Clock,
  Sparkles,
  Trophy,
  MessagesSquare,
  KanbanSquare,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Bell,
  Activity,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const socketRef = useRef(null);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['student', 'faculty', 'admin'] },
    { name: 'GPA Calculator', path: '/gpa', icon: Calculator, roles: ['student'] },
    { name: 'Notes Manager', path: '/notes', icon: BookOpen, roles: ['student', 'faculty', 'admin'] },
    { name: 'Assignments', path: '/assignments', icon: FileCheck, roles: ['student', 'faculty'] },
    { name: 'Study Planner', path: '/planner', icon: Clock, roles: ['student'] },
    { name: 'AI Study Assistant', path: '/ai-assistant', icon: Sparkles, roles: ['student'] },
    { name: 'Placement Corner', path: '/placement', icon: Trophy, roles: ['student'] },
    { name: 'Discussion Rooms', path: '/discussions', icon: MessagesSquare, roles: ['student', 'faculty', 'admin'] },
    { name: 'Projects Hub', path: '/projects', icon: KanbanSquare, roles: ['student'] },
    { name: 'Admin Analytics', path: '/admin', icon: Activity, roles: ['admin'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const isActive = (path) => location.pathname === path;

  // Load notifications
  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to retrieve notifications', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await API.put(`/notifications/${id}`);
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to update notification state', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup real-time socket connections for notifications
    const baseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = baseApi.replace('/api', '');
    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    if (user) {
      socketRef.current.emit('join_user_room', user.id);
    }

    socketRef.current.on('new_notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0d1222] border-r border-white/5 py-6 px-4">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
          StudyVerse <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">⭐</span>
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${active ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session / Logout */}
      <div className="pt-6 border-t border-white/5 mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.profile?.avatar || 'https://res.cloudinary.com/placeholder-avatar.png'}
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-purple-500/20 object-cover bg-slate-800"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-100 flex relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#070a13]/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Spacer for desktop header */}
          <div className="hidden lg:block">
            <span className="text-xs bg-[#161b30] border border-white/5 text-gray-400 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>StudyVerse ⭐ Sync Enabled</span>
            </span>
          </div>

          {/* Session details & live notifications drop */}
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-12 top-12 w-80 bg-[#0f1424] border border-white/5 rounded-3xl p-4 shadow-2xl z-30 space-y-3 max-h-[400px] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">Notifications</h4>
                      {unreadCount > 0 && <span className="text-[10px] text-purple-400 font-bold">{unreadCount} unread</span>}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-xs text-center py-6">No notifications</p>
                    ) : (
                      <div className="space-y-2.5">
                        {notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`p-3 rounded-2xl border text-xs cursor-pointer flex justify-between gap-2 transition-all ${
                              notif.isRead
                                ? 'bg-white/1 border-white/3 text-gray-500'
                                : 'bg-purple-600/5 border-purple-500/10 text-white font-medium hover:bg-purple-600/10'
                            }`}
                          >
                            <p className="line-clamp-2 leading-normal">{notif.message}</p>
                            {!notif.isRead && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 self-center" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <Link to="/profile" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <UserIcon className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
