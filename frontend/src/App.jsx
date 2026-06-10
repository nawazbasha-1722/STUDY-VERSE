import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import GPA from './pages/GPA';
import Notes from './pages/Notes';
import Assignments from './pages/Assignments';
import Planner from './pages/Planner';
import AIAssistant from './pages/AIAssistant';
import Placement from './pages/Placement';
import Discussions from './pages/Discussions';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <AuthProvider>
      <CustomCursor />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="gpa" element={<GPA />} />
            <Route path="notes" element={<Notes />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="planner" element={<Planner />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="placement" element={<Placement />} />
            <Route path="discussions" element={<Discussions />} />
            <Route path="projects" element={<Projects />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
