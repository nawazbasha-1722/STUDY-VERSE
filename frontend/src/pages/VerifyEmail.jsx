import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, GraduationCap } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await API.get(`/auth/verify-email/${token}`);
        if (response.data?.success) {
          setStatus('success');
          setMessage(response.data.message || 'Your email has been verified!');
        } else {
          setStatus('error');
          setMessage(response.data?.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The token may be expired.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0f1424]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30 mb-3">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Email Verification</h1>
        </div>

        <div className="my-8 flex flex-col items-center justify-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-400">Verifying your account details...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-white font-medium text-lg mb-2">Success!</p>
              <p className="text-gray-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-white font-medium text-lg mb-2">Verification Failed</p>
              <p className="text-gray-400">{message}</p>
            </>
          )}
        </div>

        <div className="pt-6 border-t border-white/5">
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition-all text-sm w-full"
          >
            Go to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
