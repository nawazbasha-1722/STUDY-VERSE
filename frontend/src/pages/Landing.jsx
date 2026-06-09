import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BrainCircuit,
  MessageSquare,
  Trophy,
  KanbanSquare,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#070a13] text-white relative overflow-hidden font-sans">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] bg-gradient-to-b from-purple-500/5 via-indigo-500/5 to-transparent rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight flex items-center gap-1">
            StudyVerse <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">⭐</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300 font-medium">
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#placement" className="hover:text-purple-400 transition-colors">Placement Corner</a>
          <a href="#collaboration" className="hover:text-purple-400 transition-colors">Collaboration</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-purple-400 transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium py-2 px-4 rounded-xl transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-xs text-purple-300 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation College ERP & Learning AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.15] mb-8"
        >
          Your All-In-One{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Universe
          </span>{' '}
          for Student Growth
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Streamline attendance, calculate GPA, upload and search notes, collaborate in real-time,
          and prepare for placements with our advanced AI Study Assistant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/register"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="bg-[#0f1424] hover:bg-[#161b30] border border-white/5 font-medium py-3.5 px-8 rounded-xl transition-all"
          >
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Platform Capabilities</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Everything you need to succeed in your college journey, integrated into a unified hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0f1424] border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Study Assistant</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload PDF/DOCX materials to automatically generate summaries, mock exam MCQs, interactive flashcards, and prompt instant concept Q&As.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f1424] border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-Time Discussions</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Join discussion groups with WebRTC audio streams, synchronized whiteboards, file sharing, and AI-driven moderation audits.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f1424] border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-all group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Placement Corner</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Solve coding challenges, complete aptitude mock series (DBMS, OS, CN, OOPS), and complete AI-driven mock audio/text interviews.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0f1424] border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Academic Management</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Track subject-wise class attendance with safety notifications, submit faculty-assigned tasks, and perform GPA metrics calculations.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0f1424] border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-all group">
            <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <KanbanSquare className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Kanban Collaboration</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Establish group team projects with interactive boards, coordinate file releases, set assignment tasks, and chat with team members.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0f1424] border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-all group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Role Support</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Separate dashboards tailored for students, faculties (attendance updates, task uploads), and admins (system resource diagnostics).
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>© 2026 StudyVerse ⭐. Engineered for premium student growth and productivity.</p>
      </footer>
    </div>
  );
};

export default Landing;
