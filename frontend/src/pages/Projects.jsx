import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KanbanSquare,
  Plus,
  Loader2,
  FolderPlus,
  Send,
  MessageSquare,
  User,
  Calendar,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null); // Detailed project workspace
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creation form states
  const [createOpen, setCreateOpen] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // New task states
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeEmail: '', dueDate: '' });
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  // Message states
  const [typedMessage, setTypedMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      if (res.data?.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      setError('Failed to fetch project list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    // Array of emails
    const emails = memberEmailInput
      .split(',')
      .map((em) => em.trim())
      .filter((em) => em.length > 5);

    try {
      const res = await API.post('/projects', {
        name: projName,
        description: projDesc,
        memberEmails: emails,
      });

      if (res.data?.success) {
        setProjects([res.data.project, ...projects]);
        setCreateOpen(false);
        setProjName('');
        setProjDesc('');
        setMemberEmailInput('');
        handleLoadProjectDetails(res.data.project._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
    } finally {
      setCreateLoading(false);
    }
  };

  // Load detailed workspace info
  const handleLoadProjectDetails = async (id) => {
    try {
      const res = await API.get(`/projects/${id}`);
      if (res.data?.success) {
        setActiveProject(res.data.project);
      }
    } catch (err) {
      console.error('Failed to retrieve project details', err);
    }
  };

  // Add Task to Kanban
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskLoading(true);

    try {
      const res = await API.post(`/projects/${activeProject._id}/tasks`, taskForm);
      if (res.data?.success) {
        setTaskOpen(false);
        setTaskForm({ title: '', description: '', assigneeEmail: '', dueDate: '' });
        handleLoadProjectDetails(activeProject._id);
      }
    } catch (err) {
      console.error('Failed to publish task', err);
    } finally {
      setTaskLoading(false);
    }
  };

  // Update Task status column
  const handleMoveTask = async (taskId, currentStatus) => {
    const nextStatusMap = {
      todo: 'doing',
      doing: 'done',
      done: 'todo',
    };

    const nextStatus = nextStatusMap[currentStatus];

    try {
      const res = await API.put(`/projects/${activeProject._id}/tasks/${taskId}`, {
        status: nextStatus,
      });
      if (res.data?.success) {
        handleLoadProjectDetails(activeProject._id);
      }
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  // Post Chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage) return;

    const msg = typedMessage;
    setTypedMessage('');
    setMessageLoading(true);

    try {
      const res = await API.post(`/projects/${activeProject._id}/message`, { text: msg });
      if (res.data?.success) {
        // Optimistic refresh
        handleLoadProjectDetails(activeProject._id);
      }
    } catch (err) {
      console.error('Message posting failed', err);
    } finally {
      setMessageLoading(false);
    }
  };

  // Helper: group tasks by status
  const tasksByStatus = {
    todo: activeProject?.tasks?.filter((t) => t.status === 'todo') || [],
    doing: activeProject?.tasks?.filter((t) => t.status === 'doing') || [],
    done: activeProject?.tasks?.filter((t) => t.status === 'done') || [],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <KanbanSquare className="w-8 h-8 text-purple-400" />
            <span>Project Collaboration Hub</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Build student project teams, assign workflow tasks on a Kanban board, and chat.
          </p>
        </div>
        {!activeProject && (
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 px-6 rounded-2xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0"
          >
            <FolderPlus className="w-4.5 h-4.5" />
            <span>Create Project Group</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main projects workspace routing */}
      {!activeProject ? (
        <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Your Collaborations</h3>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">No active projects. Start a new one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="bg-[#161b30] border border-white/5 p-6 rounded-3xl flex flex-col justify-between hover:border-purple-500/10 transition-all shadow-md"
                >
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-white">{proj.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-6 flex justify-between items-center text-xs text-gray-500">
                    <span>{proj.members?.length || 1} Team Members</span>
                    <button
                      onClick={() => handleLoadProjectDetails(proj._id)}
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Workspace: Kanban Board + Chat */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Kanban workspace */}
          <div className="xl:col-span-3 bg-[#0f1424] border border-white/5 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h3 className="text-xl font-bold text-white">{activeProject.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{activeProject.description || 'Project workspace.'}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTaskOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => setActiveProject(null)}
                  className="bg-[#161b30] hover:bg-white/5 border border-white/5 text-gray-400 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Leave Workspace
                </button>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 pt-2">
              {['todo', 'doing', 'done'].map((status) => {
                const list = tasksByStatus[status];
                const headerStyle = {
                  todo: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                  doing: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                  done: 'text-green-400 bg-green-500/10 border-green-500/20',
                };
                return (
                  <div key={status} className="bg-[#131828] border border-white/3 rounded-2xl p-4 flex flex-col space-y-4 min-h-[300px]">
                    <div className={`px-3 py-1.5 rounded-xl border text-center text-xs font-bold uppercase tracking-wider ${headerStyle[status]}`}>
                      {status === 'todo' ? 'To Do' : status === 'doing' ? 'In Progress' : 'Completed'} ({list.length})
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {list.length === 0 ? (
                        <p className="text-gray-600 text-[10px] text-center italic py-12">No tasks in this column.</p>
                      ) : (
                        list.map((task) => (
                          <div
                            key={task._id}
                            className="bg-[#1c2239] border border-white/5 p-4 rounded-2xl space-y-3 hover:border-purple-500/10 transition-all shadow-sm group"
                          >
                            <h4 className="font-semibold text-white text-xs">{task.title}</h4>
                            {task.description && (
                              <p className="text-[10px] text-gray-500 leading-relaxed">{task.description}</p>
                            )}

                            <div className="flex justify-between items-center pt-2.5 border-t border-white/3 mt-2 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-purple-400" />
                                <span>{task.assignee?.name || 'Unassigned'}</span>
                              </span>
                              <button
                                onClick={() => handleMoveTask(task._id, task.status)}
                                className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                              >
                                Move →
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Project group Chat */}
          <div className="bg-[#0f1424] border border-white/5 rounded-3xl p-6 h-[500px] flex flex-col justify-between shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span>Project Chat</span>
            </h3>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 text-xs">
              {activeProject.messages?.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No messages yet. Say hello!</p>
              ) : (
                activeProject.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === user.id ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.senderName}</span>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                        msg.sender === user.id
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-[#161b30] text-gray-200 border border-white/5 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/5">
              <input
                type="text"
                required
                placeholder="Type group message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={messageLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {messageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. Create Project Modal Drawer */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1424] border border-white/5 rounded-3xl p-8 max-w-md w-full z-10 space-y-6 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-6 h-6 text-purple-400" />
                <span>Create Project Group</span>
              </h2>

              <form onSubmit={handleCreateProject} className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. StudyVerse App"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Description</label>
                  <textarea
                    placeholder="Describe project goal objectives..."
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows="2"
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Member Invite Emails</label>
                  <input
                    type="text"
                    placeholder="e.g. user1@college.edu, user2@college.edu"
                    value={memberEmailInput}
                    onChange={(e) => setMemberEmailInput(e.target.value)}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Separate emails with commas.</span>
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 px-6 rounded-xl text-white font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    {createLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Create Group</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Create Task Modal Drawer */}
      <AnimatePresence>
        {taskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTaskOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1424] border border-white/5 rounded-3xl p-8 max-w-md w-full z-10 space-y-6 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5.5 h-5.5 text-purple-400" />
                <span>Create Kanban Task</span>
              </h2>

              <form onSubmit={handleCreateTask} className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design User Schema"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-2">Description</label>
                  <textarea
                    placeholder="Notes..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows="2"
                    className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-2">Assignee Email</label>
                    <input
                      type="email"
                      placeholder="assignee@college.edu"
                      value={taskForm.assigneeEmail}
                      onChange={(e) => setTaskForm({ ...taskForm, assigneeEmail: e.target.value })}
                      className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-2">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full bg-[#161b30] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setTaskOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={taskLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 px-6 rounded-xl text-white font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    {taskLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Publish Task</span>
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

export default Projects;
