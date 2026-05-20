import { Link } from 'react-router-dom';

/**
 * High-Fidelity Landing Home Page
 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20">
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center space-x-2 bg-brand-950/40 border border-brand-900/60 px-3 py-1 rounded-full text-xs font-semibold text-brand-300 tracking-wide uppercase shadow-[0_0_20px_rgba(92,108,255,0.1)]">
          <span>⚡ Now in Public Beta</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-tight">
          Unify Your Team.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-indigo-600">
            Streamline Workflows.
          </span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          The collaborative task suite engineered for high-performance product organizations. Manage projects, assign tasks, and track real-time delivery metrics in one single pane of glass.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link to="/dashboard" className="btn-primary text-base font-semibold px-8 py-3.5 flex items-center space-x-2 group">
            <span>Explore Dashboard</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link to="/signup" className="btn-secondary text-base font-semibold px-8 py-3.5">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Stats Board */}
      <div className="w-full max-w-5xl mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 p-1 bg-slate-900/20 border border-slate-900 rounded-3xl backdrop-blur-md">
        {[
          { metric: '99.99%', label: 'Platform Uptime' },
          { metric: '<15ms', label: 'Query Latency' },
          { metric: '250k+', label: 'Tasks Resolved' },
          { metric: '10x', label: 'Velocity Gains' },
        ].map((stat, i) => (
          <div key={i} className="text-center py-8 rounded-2xl bg-slate-950/40 border border-slate-900/20">
            <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{stat.metric}</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Grids */}
      <div className="w-full max-w-6xl mt-24 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Engineered to accelerate release cycles</h2>
          <p className="text-slate-400 max-w-xl mx-auto font-light">Eliminate bottleneck points with state of the art task management assets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">Relational Projects</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Organize deliverables inside isolated context grids. Setup memberships and enforce scoping boundaries across work divisions.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider group-hover:underline">Learn more →</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">Dynamic Priorities</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Classify tasks using standard high, medium, and low indexes. Track due dates and trigger warnings as completion timelines approach.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider group-hover:underline">Learn more →</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Unified Memberships</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Connect members and admins inside many-to-many relationship mappings. Enforce role parameters and assign task modules to individual contributors.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider group-hover:underline">Learn more →</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
