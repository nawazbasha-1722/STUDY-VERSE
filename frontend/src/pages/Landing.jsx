import React from 'react';
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
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#070913] text-white relative overflow-hidden font-sans">
      {/* Background glowing overlays */}
      <div className="absolute top-[-200px] left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[100px] right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-1/3 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight flex items-center gap-1.5 text-white">
            StudyVerse <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">⭐</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#placement" className="hover:text-purple-400 transition-colors">Placements</a>
          <a href="#collaboration" className="hover:text-purple-400 transition-colors">Collaboration</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:border-purple-500/30"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs text-purple-300 mb-8 font-semibold shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation College ERP & Learning AI Hub</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7.5xl font-extrabold tracking-tight leading-[1.1] mb-8 text-white max-w-5xl mx-auto"
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
          className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Streamline attendance logs, configure GPA baselines, search academic notes, coordinate projects,
          and prepare for placements with our advanced interactive AI Study Assistant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/register"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer text-sm hover:-translate-y-0.5 duration-200"
          >
            <span>Register Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="bg-[#0f1424] hover:bg-[#161b30] border border-white/5 font-semibold py-4 px-8 rounded-xl transition-all text-sm hover:border-purple-500/25"
          >
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center mb-20 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Core Platform Capabilities</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Everything you need to excel in your college journey, integrated into a single responsive portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="glass-card glass-card-hover p-8 rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-300" />
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Study Assistant</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Upload PDF/DOCX course materials to auto-generate summarized notes, diagnostic MCQs, custom flashcard decks, and obtain instant context Q&A replies.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover p-8 rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-Time Discussions</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Create virtual study rooms featuring peer WebRTC audio feeds, shared interactive whiteboards, instant file transfers, and automated AI mod audits.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover p-8 rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-300" />
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <Trophy className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Placement Corner</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Solve curated DSA challenges, test aptitude readiness (DBMS, OS, Networks), and take technical audio mock interviews driven entirely by AI evaluation.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card glass-card-hover p-8 rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Academic Tracking</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Monitor subject lecture attendance, evaluate custom CGPA baseline stats, compute GPA forecasts, and turn in class assignments.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card glass-card-hover p-8 rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/10 transition-all duration-300" />
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <KanbanSquare className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Project Collaboration</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Establish group projects with interactive Kanban boards, file attachments, individual assignment lists, and real-time team comments.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card glass-card-hover p-8 rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300" />
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Multi-Role Dashboards</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Specific, tailored portals for students (study, track), faculty (log attendance, upload tasks), and system administrators (resource diagnostics).
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <div className="glass-card p-8 sm:p-12 rounded-[36px] relative overflow-hidden text-center shadow-2xl border border-white/5">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-3xl sm:text-4.5xl font-extrabold mb-6 leading-tight text-white tracking-tight">
            Ready to elevate your college experience?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed font-normal">
            Join thousands of students and faculty members collaborating, studying smarter, and accelerating their placement preparation in StudyVerse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer text-sm hover:-translate-y-0.5 duration-200"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="bg-[#161b30] hover:bg-[#1e2444] border border-white/5 font-semibold py-4 px-8 rounded-xl text-gray-300 hover:text-white transition-all text-sm hover:border-purple-500/20"
            >
              Sign In to Your Hub
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center text-gray-500 text-xs sm:text-sm font-normal">
        <p>© 2026 StudyVerse ⭐. Engineered for premium student growth and productivity.</p>
      </footer>
    </div>
  );
};

export default Landing;
