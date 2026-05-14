import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-700 hover:text-brand-700 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-brand-700 mr-2">
            JobPortal
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/jobs" className={navLinkClass}>Browse Jobs</NavLink>
            <NavLink to="/companies" className={navLinkClass}>Companies</NavLink>
            {user?.role === 'CANDIDATE' && (
              <>
                <NavLink to="/candidate" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/candidate/applications" className={navLinkClass}>My Applications</NavLink>
                <NavLink to="/candidate/saved" className={navLinkClass}>Saved</NavLink>
                <NavLink to="/candidate/profile" className={navLinkClass}>Profile</NavLink>
              </>
            )}
            {user?.role === 'EMPLOYER' && (
              <>
                <NavLink to="/employer" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/employer/jobs" className={navLinkClass}>My Jobs</NavLink>
                <NavLink to="/employer/jobs/new" className={navLinkClass}>Post a Job</NavLink>
                <NavLink to="/employer/company" className={navLinkClass}>Company</NavLink>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {user && <NotificationBell />}
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-slate-600">{user.email}</span>
                <button onClick={handleLogout} className="btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-sm text-slate-500 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} JobPortal</span>
          <span>
            <a href="/api/docs" className="hover:text-brand-700">API Docs</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
