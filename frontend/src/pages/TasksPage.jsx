import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const statusColors = {
  TODO: 'bg-slate-950 border-slate-800 text-slate-300',
  IN_PROGRESS: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
  COMPLETED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
};

const priorityColors = {
  LOW: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
  MEDIUM: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  HIGH: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
};

const emptyForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: '',
  assignedTo: '',
  projectId: '',
};

function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TasksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: '', assignedTo: '' });
  const [form, setForm] = useState(emptyForm);
  const [editingTask, setEditingTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const projectMembers = useMemo(() => {
    const activeProject = projects.find((project) => project.id === form.projectId);
    if (!activeProject?.members?.length) return [];
    return activeProject.members
      .map((member) => member.user)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [form.projectId, projects]);

  const loadTasks = async () => {
    setError('');
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value)
    );

    try {
      const response = await api.get('/api/tasks', { params });
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tasks.');
    }
  };

  const loadWorkspaceData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const requests = [api.get('/api/projects'), api.get('/api/tasks')];
      if (isAdmin) requests.push(api.get('/api/users'));

      const [projectsResponse, tasksResponse, usersResponse] = await Promise.all(requests);
      setProjects(projectsResponse.data.projects || []);
      setTasks(tasksResponse.data.tasks || []);
      setUsers(usersResponse?.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load task workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [isAdmin]);

  useEffect(() => {
    if (!isLoading) {
      loadTasks();
    }
  }, [filters.status, filters.priority, filters.projectId, filters.assignedTo]);

  const openCreateForm = () => {
    setEditingTask(null);
    setForm({
      ...emptyForm,
      projectId: projects[0]?.id || '',
    });
    setFormError('');
    setNotice('');
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'TODO',
      dueDate: toDateInputValue(task.dueDate),
      assignedTo: task.assignedTo || '',
      projectId: task.projectId || '',
    });
    setFormError('');
    setNotice('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!form.title.trim() || !form.projectId) {
      setFormError('Task title and project are required.');
      return;
    }

    if (form.dueDate && Number.isNaN(new Date(form.dueDate).getTime())) {
      setFormError('Due date must be a valid date.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || null,
      assignedTo: form.assignedTo || null,
      projectId: form.projectId,
    };

    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, payload);
        setNotice('Task updated successfully.');
        toast.success('Task updated successfully.');
      } else {
        await api.post('/api/tasks', payload);
        setNotice('Task created successfully.');
        toast.success('Task created successfully.');
      }

      await loadTasks();
      setIsFormOpen(false);
      setEditingTask(null);
      setForm(emptyForm);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to save task.';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTaskStatus = async (task, nextStatus) => {
    const previousTasks = tasks;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    );

    try {
      const response = await api.put(`/api/tasks/${task.id}`, { status: nextStatus });
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? response.data.task : item))
      );
      toast.success('Task status updated.');
    } catch (err) {
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Unable to update task status.';
      setError(message);
      toast.error(message);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task permanently?')) return;

    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to delete task.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex-grow py-4 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Task Board</h1>
          <p className="text-sm text-slate-400">Track assignments, priorities, due dates, and live status updates.</p>
        </div>

        {isAdmin && (
          <button onClick={openCreateForm} className="btn-primary self-start text-xs font-semibold">
            Create Task
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>

          <select
            value={filters.projectId}
            onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={filters.assignedTo}
              onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
            >
              <option value="">All assignees</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500/10 border-t-brand-500" />
          <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Loading tasks</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel rounded-3xl p-14 text-center">
          <h2 className="text-lg font-bold text-white">No tasks found</h2>
          <p className="mt-2 text-sm text-slate-500">Adjust filters or create a new task when admin access is available.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-900">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr_1fr_1fr_0.7fr] gap-4 bg-slate-950/80 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 lg:grid">
            <span>Title</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Due date</span>
            <span>Assigned user</span>
            <span>Project</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-900">
            {tasks.map((task) => (
              <div key={task.id} className="grid gap-4 bg-slate-900/35 px-5 py-4 lg:grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr_1fr_1fr_0.7fr] lg:items-center">
                <div>
                  <h3 className="font-bold text-white">{task.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-450">{task.description || 'No description.'}</p>
                </div>

                <select
                  value={task.status}
                  onChange={(event) => updateTaskStatus(task, event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold uppercase outline-none ${statusColors[task.status]}`}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>

                <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>

                <span className="text-sm text-slate-300">{formatDate(task.dueDate)}</span>
                <span className="text-sm text-slate-300">{task.assignee?.name || 'Unassigned'}</span>
                <span className="text-sm text-slate-300">{task.project?.name || 'Unknown project'}</span>

                <div className="flex items-center justify-start gap-2 lg:justify-end">
                  {isAdmin && (
                    <>
                      <button onClick={() => openEditForm(task)} className="btn-secondary px-3 py-2 text-xs">Edit</button>
                      <button onClick={() => deleteTask(task.id)} className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close task form"
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
          />

          <form onSubmit={handleSubmit} className="glass-panel relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                X
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Title</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                  required
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Project</span>
                <select
                  value={form.projectId}
                  onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value, assignedTo: '' }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Assignee</span>
                <select
                  value={form.assignedTo}
                  onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                {form.projectId && projectMembers.length === 0 && (
                  <p className="text-xs text-slate-500">Add members to this project before assigning tasks.</p>
                )}
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Due Date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary text-xs disabled:opacity-50">
                {isSubmitting ? 'Saving...' : editingTask ? 'Save Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
