import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Projects Dashboard View
 */
export default function ProjectsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal Creation form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch projects from secure API
  const fetchProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/api/projects');
      if (response.data && response.data.success) {
        setProjects(response.data.projects);
      } else {
        setError('Failed to retrieve projects list.');
      }
    } catch (err) {
      console.error('[Projects Page] Fetching error:', err);
      setError(err.response?.data?.message || 'Error communicating with backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setModalError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/projects', {
        name: name.trim(),
        description: description.trim(),
      });

      if (response.data && response.data.success) {
        setSuccessMsg('Project created successfully!');
        toast.success('Project created successfully.');
        setName('');
        setDescription('');
        
        // Refresh project list and close modal with short delay for feedback
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg('');
          fetchProjects();
        }, 1000);
      } else {
        setModalError(response.data.message || 'Failed to create project.');
        toast.error(response.data.message || 'Failed to create project.');
      }
    } catch (err) {
      console.error('[Projects Page] Project creation error:', err);
      const message = err.response?.data?.message || 'An error occurred while creating the project.';
      setModalError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4 flex-grow relative">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Projects</h1>
          <p className="text-slate-400 text-sm">Review active projects scope and membership directories.</p>
        </div>

        {/* ADMIN only Create Project button */}
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs font-semibold py-2.5 px-4.5 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm max-w-2xl">
          <span>{error}</span>
        </div>
      )}

      {/* Projects List Segment */}
      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-3 border-brand-500/10 border-t-brand-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center border border-slate-900 max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-brand-500/5 border border-brand-500/10 rounded-full flex items-center justify-center text-brand-400 mx-auto shadow-2xl">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-200">No Projects Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
              {user?.role === 'ADMIN' 
                ? 'Your project registry is currently empty. Initialize a new project and add members to kickstart deliverables.'
                : 'You are not registered in any active projects. Contact your system administrator to assign you to a project workspace.'}
            </p>
          </div>
          
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary py-2.5 px-6 text-xs font-semibold uppercase tracking-wider mx-auto"
            >
              Initialize First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}`}
              className="glass-card p-6 rounded-3xl border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/35 transition-all duration-300 flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-brand-400 transition-colors">
                    {project.name}
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 group-hover:text-brand-400 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
                
                <p className="text-xs text-slate-450 font-light leading-relaxed line-clamp-3">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* Counters footer info */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-900/60 text-2xs font-semibold text-slate-500">
                <span className="flex items-center space-x-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{project.members?.length || 0} Members</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                  <span>{project._count?.tasks || 0} Tasks</span>
                </span>
              </div>

            </Link>
          ))}
        </div>
      )}

      {/* ADMIN Creation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-6">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0"
            aria-hidden="true"
          />

          <div className="relative z-50 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Initialize Project</h2>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Close project modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error alerts inside Modal */}
            {modalError && (
              <div className="mt-5 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
                <span>{modalError}</span>
              </div>
            )}

            {/* Success notification */}
            {successMsg && (
              <div className="mt-5 flex items-center space-x-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-sm text-emerald-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
              
              {/* Project Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-200">Project Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Phoenix Falcon Rebuild"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Project Description */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-200">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize project boundaries and sprint objectives..."
                  rows="4"
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Action Triggers */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-w-32 items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}
