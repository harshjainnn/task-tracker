import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * High-Fidelity Project Details and Operations Workspace
 */
export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Member form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Edit Project state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch single project details
  const fetchProjectDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/projects/${id}`);
      if (response.data && response.data.success) {
        setProject(response.data.project);
        setEditName(response.data.project.name);
        setEditDesc(response.data.project.description || '');
      } else {
        setError('Failed to fetch project workspace details.');
      }
    } catch (err) {
      console.error('[Project Details] Fetching error:', err);
      setError(err.response?.data?.message || 'Error communicating with database.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'ADMIN') return;

    try {
      const response = await api.get('/api/users');
      if (response.data?.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error('[Project Details] Users fetch error:', err);
      toast.error(err.response?.data?.message || 'Failed to load user directory.');
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchUsers();
  }, [id]);

  const availableUsers = useMemo(() => {
    const assignedIds = new Set((project?.members || []).map((member) => member.userId));
    const search = memberSearch.trim().toLowerCase();

    return users
      .filter((candidate) => !assignedIds.has(candidate.id))
      .filter((candidate) => {
        if (!search) return true;
        return (
          candidate.name.toLowerCase().includes(search) ||
          candidate.email.toLowerCase().includes(search)
        );
      });
  }, [memberSearch, project?.members, users]);

  // Handler: Add Member by selected user id
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setMemberSuccess('');

    if (!selectedMemberId) {
      setMemberError('Select a user to add to this project.');
      return;
    }

    setIsAddingMember(true);
    try {
      const response = await api.post(`/api/projects/${id}/members`, {
        userId: selectedMemberId,
      });

      if (response.data && response.data.success) {
        setMemberSuccess('User added to project membership successfully!');
        toast.success('Member added to project.');
        setSelectedMemberId('');
        setMemberSearch('');
        fetchProjectDetails(); // Reload details to reflect new member
        fetchUsers();
      }
    } catch (err) {
      console.error('[Project Details] Add member error:', err);
      const message = err.response?.data?.message || 'Failed to add project member.';
      setMemberError(message);
      toast.error(message);
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handler: Update Project details
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsSaving(true);

    if (!editName.trim()) {
      setEditError('Project name cannot be empty.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await api.put(`/api/projects/${id}`, {
        name: editName.trim(),
        description: editDesc.trim(),
      });

      if (response.data && response.data.success) {
        setIsEditing(false);
        toast.success('Project updated successfully.');
        fetchProjectDetails();
      }
    } catch (err) {
      console.error('[Project Details] Update project error:', err);
      const message = err.response?.data?.message || 'Failed to update project.';
      setEditError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Delete Project
  const handleDeleteProject = async () => {
    const confirmDelete = window.confirm(
      '⚠️ WARNING: Are you sure you want to delete this project? This will permanently delete all tasks, metrics, and memberships.'
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/api/projects/${id}`);
      if (response.data && response.data.success) {
        toast.success('Project deleted successfully.');
        navigate('/projects');
      }
    } catch (err) {
      console.error('[Project Details] Deletion error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete project.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-3 border-brand-500/10 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Syncing project workspace...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Project Workspace Error</h2>
          <p className="text-sm text-slate-405 font-light">{error || 'Project not found.'}</p>
        </div>
        <button onClick={() => navigate('/projects')} className="btn-secondary text-xs uppercase px-5 py-2.5">
          Back to Projects
        </button>
      </div>
    );
  }

  // Analytical stats computations
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
  const inProgressTasks = project.tasks?.filter((t) => t.status === 'IN_PROGRESS').length || 0;
  const todoTasks = project.tasks?.filter((t) => t.status === 'TODO').length || 0;
  
  // Calculate completion percentage
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityColors = {
    HIGH: 'bg-red-500/10 border-red-500/30 text-red-400',
    MEDIUM: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    LOW: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const statusColors = {
    TODO: 'bg-slate-900 border-slate-800 text-slate-450',
    IN_PROGRESS: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    COMPLETED: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  };

  return (
    <div className="space-y-8 py-4 flex-grow">
      
      {/* Dynamic Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-900 pb-6">
        {isEditing ? (
          <form onSubmit={handleUpdateProject} className="flex-grow max-w-2xl space-y-4">
            {editError && <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">{editError}</div>}
            
            <div className="space-y-3">
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-base text-slate-100 focus:outline-none focus:border-brand-500"
                placeholder="Project Name"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500 resize-none"
                placeholder="Description"
                rows="3"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button type="submit" disabled={isSaving} className="btn-primary py-2 px-4 text-xs font-semibold">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-4 text-xs">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
              {user?.role === 'ADMIN' && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-slate-500 hover:text-brand-400 p-1 rounded hover:bg-slate-900 transition-colors"
                  title="Edit project details"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-slate-400 text-sm max-w-3xl font-light leading-relaxed">{project.description || 'No description provided.'}</p>
          </div>
        )}

        {/* ADMIN Project Controls */}
        {user?.role === 'ADMIN' && !isEditing && (
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button 
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="px-4.5 py-2.5 rounded-xl border border-red-500/35 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Analytical dashboard summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Progress Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-900 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-400 uppercase tracking-wider">Milestone Progress Rate</span>
            <span className="text-brand-400 text-lg font-bold">{completionRate}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900">
              <div 
                className="bg-gradient-to-r from-brand-600 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-3xs font-semibold text-slate-500">
              <span>{completedTasks} of {totalTasks} Tasks Completed</span>
              <span>{totalTasks - completedTasks} Remaining</span>
            </div>
          </div>
        </div>

        {/* Mini stats */}
        {[
          { label: 'Sprint To Do', value: todoTasks, sub: 'Planning stage' },
          { label: 'In Progress', value: inProgressTasks, sub: 'Active development' }
        ].map((item, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{item.value}</span>
              <span className="text-3xs text-slate-500 font-medium">{item.sub}</span>
            </div>
          </div>
        ))}

      </div>

      {/* Workspace columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Tasks Lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Project Tasks Roadmap</h2>
            <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-350 hover:underline">Manage Tasks Sheet →</Link>
          </div>

          {project.tasks?.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-900 text-center space-y-4">
              <svg className="w-12 h-12 text-slate-650 mx-auto animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-305">Task Board is Empty</h3>
                <p className="text-xs text-slate-500 font-light max-w-sm mx-auto">No sprint tasks are currently linked to this project workspace.</p>
              </div>
              {user?.role === 'ADMIN' && (
                <Link to="/tasks" className="btn-primary py-2 px-5 text-2xs inline-block uppercase tracking-wider font-semibold">
                  Create Task
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="glass-card p-4.5 rounded-2xl border border-slate-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-3xs font-extrabold border px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-3xs text-slate-500 font-semibold">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-white text-base">{task.title}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">{task.description}</p>
                    
                    {task.assignee && (
                      <div className="flex items-center space-x-1 text-3xs font-semibold text-slate-500 pt-1">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Assigned to: <span className="text-slate-400">{task.assignee.name}</span></span>
                      </div>
                    )}
                  </div>

                  <div className="self-start sm:self-center">
                    <span className={`text-2xs font-extrabold border px-3 py-1.5 rounded-xl uppercase tracking-wider block text-center ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Members list and Add Member form */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Project Directory</h2>
          
          <div className="glass-panel p-6 rounded-3xl border border-slate-900 space-y-6">
            
            {/* Members Directory */}
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Active Members ({project.members?.length || 0})</span>
              
              <div className="divide-y divide-slate-900/60 max-h-[300px] overflow-y-auto pr-1">
                {project.members?.map((member) => (
                  <div key={member.id} className="py-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-xs font-bold text-slate-300 tracking-wider">
                      {member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-white truncate leading-snug">{member.user.name}</p>
                      <p className="text-3xs text-slate-550 truncate leading-none">{member.user.email}</p>
                    </div>

                    <span className={`text-4xs font-bold px-1.5 py-0.5 rounded border ${
                      member.user.role === 'ADMIN' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-slate-950 border-slate-900 text-slate-500'
                    }`}>
                      {member.user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN Only: Add Member Form */}
            {user?.role === 'ADMIN' && (
              <div className="border-t border-slate-900/60 pt-6 space-y-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Register Member</span>
                
                {memberError && <div className="text-2xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{memberError}</div>}
                {memberSuccess && <div className="text-2xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">{memberSuccess}</div>}

                <form onSubmit={handleAddMember} className="space-y-3">
                  <input
                    type="search"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search users by name or email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />

                  <select
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">
                      {availableUsers.length === 0 ? 'No available users to add' : 'Select a user'}
                    </option>
                    {availableUsers.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </select>

                  {availableUsers.length === 0 && (
                    <p className="text-3xs text-slate-500">
                      Every matching user is already assigned to this project.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isAddingMember || !selectedMemberId}
                    className="w-full btn-primary py-2 text-2xs font-semibold uppercase tracking-wider flex items-center justify-center"
                  >
                    {isAddingMember ? 'Registering...' : 'Add to Project'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
