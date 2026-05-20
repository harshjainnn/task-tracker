import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Premium Application Header/Navbar
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

  // Custom router state class generator
  const getNavLinkClass = ({ isActive }) => 
    `text-sm font-medium transition-all duration-300 py-1.5 px-3.5 rounded-xl ${
      isActive 
        ? 'text-brand-400 bg-brand-950/30 border border-brand-900/40 shadow-[0_0_15px_rgba(92,108,255,0.08)]' 
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border border-transparent'
    }`;

  return (
    <nav className="glass-nav sticky top-0 z-50 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Core Brand Group */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-100 transition-colors group-hover:text-white">
            Team<span className="text-brand-500">Task</span>
          </span>
        </Link>

        {/* Central Router Items (Conditional based on authentication session) */}
        <div className="hidden sm:flex items-center space-x-1 bg-slate-950/40 border border-slate-900 p-1 rounded-2xl">
          {!user ? (
            <NavLink to="/" className={getNavLinkClass} end>
              Home
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={getNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/projects" className={getNavLinkClass}>
                Projects
              </NavLink>
              <NavLink to="/tasks" className={getNavLinkClass}>
                Tasks
              </NavLink>
            </>
          )}
        </div>

        {/* User Identity Info / Sign In Options */}
        <div className="flex items-center space-x-4">
          {!user ? (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-slate-100 px-4 py-2 hover:bg-slate-900/35 rounded-xl transition-all duration-300">
                Sign In
              </Link>
              <Link to="/signup" className="text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-4.5 py-2.5 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 transition-all duration-300 active:scale-95">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3.5">
              
              {/* User Initials Badge & Role indicator */}
              <div className="hidden md:flex flex-col text-right space-y-0.5">
                <span className="text-sm font-bold text-white leading-none">{user.name}</span>
                <span className="text-4xs text-slate-500 leading-none">{user.email}</span>
              </div>

              {/* Role pill indicator */}
              <span className={`text-4xs font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                user.role === 'ADMIN' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.05)]' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                {user.role}
              </span>

              {/* Logout Trigger button */}
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 hover:border-red-500/25 border border-transparent rounded-xl transition-all duration-300"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
