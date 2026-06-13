import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Phone,
  Shield,
  Globe,
  Award,
  Mail,
  FileText,
  Camera,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

const GithubIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(1);
  const [avatar, setAvatar] = useState('');
  const [regdno, setRegdno] = useState('');
  const [platform, setPlatform] = useState('');
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Custom Avatar Input state
  const [showCustomAvatar, setShowCustomAvatar] = useState(false);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.profile?.phone || '');
      setDepartment(user.profile?.department || '');
      setYear(user.profile?.year || 1);
      setAvatar(user.profile?.avatar || '');
      setRegdno(user.profile?.regdno || '');
      setPlatform(user.profile?.platform || '');
      setGithub(user.profile?.github || '');
      setLeetcode(user.profile?.leetcode || '');
      setLinkedin(user.profile?.linkedin || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await updateProfile({
        name,
        phone,
        department,
        year: Number(year),
        avatar,
        regdno,
        platform,
        github,
        leetcode,
        linkedin,
      });

      if (res.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while saving profile settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your personal details, academic information, and coding profiles.
        </p>
      </div>

      {/* Profile Banner */}
      <div className="relative overflow-hidden bg-[#0f1424] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
        
        {/* Avatar Container */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/10 transition-transform group-hover:scale-105 duration-300">
            <img
              src={avatar || 'https://res.cloudinary.com/placeholder-avatar.png'}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
              }}
            />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border border-[#0f1424] text-white shadow-md cursor-pointer hover:bg-purple-500 transition-colors">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        {/* User Quick Info */}
        <div className="text-center md:text-left space-y-2.5 flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{name || 'User'}</h2>
            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              {user?.role}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>{user?.email}</span>
            </span>
            {regdno && (
              <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Reg No: {regdno}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Avatar Presets */}
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6 h-fit">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-400" />
              <span>Choose Profile Photo</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Select one of our preset avatars or paste a custom link.
            </p>
          </div>

          {/* Preset list */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAvatar(url);
                  setShowCustomAvatar(false);
                }}
                className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 duration-200 cursor-pointer ${
                  avatar === url
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-white/5 hover:border-purple-500/50'
                }`}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover animate-none" />
              </button>
            ))}
          </div>

          {/* Custom Avatar Link */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCustomAvatar(!showCustomAvatar)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>{showCustomAvatar ? 'Hide custom URL' : 'Use a custom image URL'}</span>
            </button>

            {showCustomAvatar && (
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Middle and Right Column - Info Fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Academic & Personal Info */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-400" />
              <span>Personal & Academic Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Registration Number</label>
                <input
                  type="text"
                  placeholder="231FA04F03"
                  value={regdno}
                  onChange={(e) => setRegdno(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Department</label>
                  <input
                    type="text"
                    placeholder="CSE"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none"
                  >
                    {[1, 2, 3, 4].map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Coding and Platform Handles */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>Coding & Platform Handles</span>
              </h3>
              <p className="text-xs text-gray-500">
                Provide your handles and profile links to sync with placement features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <GithubIcon className="w-4 h-4 text-purple-400" />
                  <span>GitHub Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>LeetCode Username</span>
                </label>
                <input
                  type="text"
                  placeholder="leetcode_username"
                  value={leetcode}
                  onChange={(e) => setLeetcode(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <LinkedinIcon className="w-4 h-4 text-purple-400" />
                  <span>LinkedIn Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Other Coding Platform</span>
                </label>
                <input
                  type="text"
                  placeholder="Codeforces, HackerRank, etc."
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Profile Previews / Social Links */}
            {(github || leetcode || linkedin) && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quick Profile Links</p>
                <div className="flex flex-wrap gap-3">
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#161b30] border border-white/5 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-[#1e2444] transition-all"
                    >
                      <GithubIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {leetcode && (
                    <a
                      href={`https://leetcode.com/${leetcode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#161b30] border border-white/5 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-[#1e2444] transition-all"
                    >
                      <Globe className="w-3.5 h-3.5 text-purple-400" />
                      <span>LeetCode</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#161b30] border border-white/5 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-[#1e2444] transition-all"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Action Bar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer text-sm font-medium hover:shadow-purple-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
