import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
      isActive
        ? 'border-brand-500/30 bg-brand-500/10 text-brand-200'
        : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100'
    }`;

  return (
    <aside className="w-full border-b border-slate-900 bg-slate-950/80 px-4 py-3 lg:sticky lg:top-[68px] lg:h-[calc(100vh-68px)] lg:w-64 lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-xs">
              {item.label.slice(0, 1)}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-200 lg:mt-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-xs">
            L
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
