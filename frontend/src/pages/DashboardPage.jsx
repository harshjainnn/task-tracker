import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ListSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const metricCards = [
  {
    key: 'totalTasks',
    title: 'Total Tasks',
    helper: 'Visible to your role',
    icon: 'T',
  },
  {
    key: 'completedTasks',
    title: 'Completed',
    helper: 'Finished work',
    icon: 'C',
  },
  {
    key: 'pendingTasks',
    title: 'Pending',
    helper: 'Todo and in progress',
    icon: 'P',
  },
  {
    key: 'overdueTasks',
    title: 'Overdue',
    helper: 'Past due and open',
    icon: 'O',
  },
];

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

function formatDate(value) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(value) {
  if (!value) return 'No activity yet';
  const created = new Date(value);
  const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000));
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  return `Updated ${days} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get('/api/dashboard/stats');
        setDashboard(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = dashboard?.stats || {};
  const distribution = dashboard?.taskDistribution || {};
  const totalDistribution = useMemo(
    () => Object.values(distribution).reduce((sum, count) => sum + Number(count || 0), 0),
    [distribution]
  );

  return (
    <div className="flex-grow space-y-8 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Welcome back, {user?.name || 'teammate'}. This view uses live backend data.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/projects" className="btn-secondary text-xs font-semibold">Projects</Link>
          <Link to="/tasks" className="btn-primary text-xs font-semibold">Tasks</Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? metricCards.map((card) => <StatCardSkeleton key={card.key} />)
          : metricCards.map((card) => (
            <div key={card.key} className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-xs font-black text-brand-300">
                  {card.icon}
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <span className="text-4xl font-extrabold text-white">{stats[card.key] ?? 0}</span>
                <span className="text-right text-xs text-slate-500">{card.helper}</span>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Task Status</h2>
            <span className="text-xs font-semibold text-slate-500">{totalDistribution} tasks</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            {isLoading ? (
              <ListSkeleton rows={3} />
            ) : totalDistribution === 0 ? (
              <EmptyState title="No task data" message="Task distribution will appear when tasks are created or assigned." />
            ) : (
              <div className="space-y-4">
                {Object.entries(statusLabels).map(([status, label]) => {
                  const count = distribution[status] || 0;
                  const percent = totalDistribution ? Math.round((count / totalDistribution) * 100) : 0;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-200">{label}</span>
                        <span className="text-slate-500">{count} ({percent}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                        <div
                          className={`h-full rounded-full ${status === 'COMPLETED' ? 'bg-emerald-400' : status === 'IN_PROGRESS' ? 'bg-cyan-400' : 'bg-slate-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs font-semibold text-brand-300 hover:text-brand-200">Manage tasks</Link>
          </div>

          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : dashboard?.recentTasks?.length ? (
            <div className="space-y-3">
              {dashboard.recentTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge value={task.priority} type="priority" />
                        <span className="text-xs font-semibold text-slate-500">{task.project?.name || 'Unknown project'}</span>
                      </div>
                      <h3 className="mt-2 font-bold text-white">{task.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.assignee?.name || 'Unassigned'} - Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <Badge value={task.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent tasks" message="Tasks will appear here as soon as they are created or assigned." />
          )}
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Projects</h2>
          <Link to="/projects" className="text-xs font-semibold text-brand-300 hover:text-brand-200">View all</Link>
        </div>

        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : dashboard?.recentProjects?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.recentProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 transition hover:border-brand-500/40">
                <h3 className="font-bold text-white">{project.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description || 'No description provided.'}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-800 bg-slate-950 px-2 py-1">{project._count?.members || 0} members</span>
                  <span className="rounded-full border border-slate-800 bg-slate-950 px-2 py-1">{project._count?.tasks || 0} tasks</span>
                  <span>{formatRelativeDate(project.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No recent projects" message="Projects will appear here when they are created or assigned to you." />
        )}
      </section>
    </div>
  );
}
