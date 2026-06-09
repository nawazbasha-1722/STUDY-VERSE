import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Upload,
  Download,
  Star,
  Loader2,
  FileText,
  Bookmark,
  FolderOpen,
} from 'lucide-react';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [favFilter, setFavFilter] = useState(false);

  // Upload modal & form
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const fetchNotes = async () => {
    try {
      setError('');
      const params = {};
      if (search) params.search = search;
      if (selectedSubject) params.subject = selectedSubject;
      if (favFilter) params.favoritesOnly = true;

      const response = await API.get('/notes', { params });
      if (response.data?.success) {
        setNotes(response.data.notes || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await API.get('/notes/subjects');
      if (response.data?.success) {
        setSubjects(response.data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search, selectedSubject, favFilter]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Handle Note Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMessage('Error: Please select a file document to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('subject', uploadForm.subject);
    formData.append('file', file);

    try {
      const response = await API.post('/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        setUploadMessage('Notes uploaded successfully!');
        setUploadForm({ title: '', description: '', subject: '' });
        setFile(null);
        fetchNotes();
        fetchSubjects();
        setTimeout(() => setUploadOpen(false), 2000);
      }
    } catch (err) {
      setUploadMessage(err.response?.data?.message || 'Failed to upload note.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle Note Download
  const handleDownload = async (noteId, fileUrl) => {
    try {
      // Register download count in DB
      await API.post(`/notes/${noteId}/download`);

      // Determine absolute path (especially if using relative local uploads fallback)
      const baseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const rootUrl = baseApi.replace('/api', ''); // Get http://localhost:5000
      const targetUrl = fileUrl.startsWith('http') ? fileUrl : `${rootUrl}${fileUrl}`;

      // Open file in new tab to trigger browser download
      window.open(targetUrl, '_blank');
      fetchNotes(); // Refresh metrics
    } catch (err) {
      console.error('Download registration failed', err);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (noteId) => {
    try {
      const res = await API.post(`/notes/${noteId}/favorite`);
      if (res.data?.success) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Favorite toggle error', err);
    }
  };

  // Rate note
  const handleRate = async (noteId, score) => {
    try {
      const res = await API.post(`/notes/${noteId}/rate`, { score });
      if (res.data?.success) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Rating note error', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notes Hub</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Search, filter, rate, and download lecture notes and revision guides.
          </p>
        </div>
        <button
          onClick={() => {
            setUploadOpen(true);
            setUploadMessage('');
          }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 px-6 rounded-2xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Study Notes</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-[#0f1424] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xl">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search notes by title, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b30] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4 items-center justify-end">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#161b30] border border-white/5 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none shrink-0"
          >
            <option value="">All Subjects</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFavFilter(!favFilter)}
            className={`px-4 py-3 rounded-2xl text-sm font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
              favFilter
                ? 'bg-purple-600/15 border-purple-500 text-purple-400'
                : 'bg-[#161b30] border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 bg-[#0f1424] border border-white/5 rounded-3xl">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Notes Found</h3>
          <p className="text-gray-400 text-sm">Be the first to upload lecture notes for this course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const hasUserFav = note.favorites?.includes(user?.id);
            return (
              <motion.div
                key={note._id}
                whileHover={{ y: -4 }}
                className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {note.subject}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(note._id)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        hasUserFav
                          ? 'bg-purple-600/10 border-purple-500/20 text-purple-400'
                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{note.title}</h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                    {note.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5 mt-auto">
                  {/* Rating selection row */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(note._id, star)}
                          className="text-gray-500 hover:text-yellow-400 p-0.5 cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= (note.averageRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-gray-400 ml-1">({note.averageRating || '0'})</span>
                    </div>
                    <span className="text-gray-500">By {note.uploadedBy?.name}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>{note.downloadsCount || 0} Downloads</span>
                    </span>

                    <button
                      onClick={() => handleDownload(note._id, note.fileUrl)}
                      className="bg-[#161b30] hover:bg-[#1f2644] border border-white/5 py-2 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Download File</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal Drawer */}
      <AnimatePresence>
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1424] border border-white/5 rounded-3xl p-8 max-w-lg w-full z-10 space-y-6 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-5.5 h-5.5 text-purple-400" />
                <span>Upload Lecture Notes</span>
              </h2>

              {uploadMessage && (
                <div
                  className={`px-4 py-3 rounded-xl text-sm ${
                    uploadMessage.startsWith('Error')
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                      : 'bg-green-500/10 border border-green-500/20 text-green-400'
                  }`}
                >
                  {uploadMessage}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Notes Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3 Database Recovery Techniques"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Provide short details about the chapters covered..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows="3"
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DBMS, OS"
                      value={uploadForm.subject}
                      onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                      className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                      Document File
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        required
                        onChange={(e) => setFile(e.target.files[0])}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        id="note-file-upload"
                      />
                      <label
                        htmlFor="note-file-upload"
                        className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-3 text-gray-400 text-sm flex items-center justify-between cursor-pointer hover:bg-[#1e2444] transition-colors"
                      >
                        <span className="truncate max-w-[120px]">{file ? file.name : 'Select document'}</span>
                        <FileText className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setUploadOpen(false)}
                    className="px-5 py-3 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 px-6 rounded-xl text-white font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Upload Notes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;
