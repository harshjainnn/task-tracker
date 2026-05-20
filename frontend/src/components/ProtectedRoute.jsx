import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Access Guard Router Wrapper
 * Prevents unauthenticated entry and handles role-based gates.
 */
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  // 1. Show elegant loading spinner while checking JWT verification
  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-3 border-brand-500/10 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Hydrating Session...</span>
      </div>
    );
  }

  // 2. Redirect unauthenticated sessions
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Enforce Administrator role gates
  if (adminOnly && user.role !== 'ADMIN') {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 max-w-md mx-auto space-y-6">
        
        {/* Lock Vector Element */}
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/5 animate-pulse">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Permission Denied</h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            This module is restricted to system administrators. Standard project members do not have the credentials required to access this workspace.
          </p>
        </div>

        <div className="pt-2">
          <a href="/dashboard" className="btn-secondary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider block">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // 4. Render protected child routes
  return <Outlet />;
}
