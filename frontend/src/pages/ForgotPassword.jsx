import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { GraduationCap, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { motion as m } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await API.post('/auth/forgot-password', { email });
      if (response.data?.success) {
        setMessage(response.data.message || 'If an account exists with this email, a reset link has been sent!');
      } else {
        setError(response.data?.message || 'Password reset request failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">StudyVerse <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">⭐</span></h1>
          <p className="text-gray-400 text-sm mt-1">Recover your account credentials</p>
        </div>

        <div className="bg-[#0f1424]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-4 font-sans">Reset Password Request</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your college email address, and we will send you a secured link to reset your account password.
          </p>

          {error && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6"
            >
              {error}
            </m.div>
          )}

          {message && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-6"
            >
              {message}
            </m.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                College Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                />
              </div>
            </div>

            <m.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </m.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default ForgotPassword;
