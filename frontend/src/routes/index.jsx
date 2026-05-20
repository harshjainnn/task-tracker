import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import SignupPage from '../pages/SignupPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProjectsPage from '../pages/ProjectsPage.jsx';
import ProjectDetailsPage from '../pages/ProjectDetailsPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

/**
 * Centalized Routing Definition
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Root shell wrapper providing consistent header, footer and state notifications */}
      <Route path="/" element={<RootLayout />}>
        
        {/* Public Auth/Landing paths */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        
        {/* Protected Session Access Gates */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>
        
        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-brand-500">404</h1>
            <h2 className="text-2xl font-bold mt-4">Section Lost in Space</h2>
            <p className="text-slate-400 mt-2 max-w-md">The route you requested could not be found. Double check the address bar or return back to safer orbits.</p>
            <a href="/" className="btn-primary mt-6">Return to Base</a>
          </div>
        } />
      </Route>
    </Routes>
  );
}
