import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

/**
 * Global App Root Shell
 */
export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      {/* Navigation Header */}
      <Navbar />

      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />

        {/* Main Content Render Box */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <Outlet />
        </main>
      </div>

      {/* Footer bar */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Team Task Manager Inc. Built for high-velocity software engineering organizations.</p>
        </div>
      </footer>
    </div>
  );
}
