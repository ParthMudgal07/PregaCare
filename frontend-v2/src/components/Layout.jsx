import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogOut } from 'lucide-react';

const Layout = ({ children, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Outfit']">
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-6xl mx-auto glass-card px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <Heart size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">PregaCare <span className="text-indigo-600">AI</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <Link to="/" className={`${location.pathname === '/' ? 'text-indigo-600' : 'hover:text-indigo-600'} transition-colors`}>Home</Link>
            {user && (
              <>
                <Link to="/assess" className={`${location.pathname === '/assess' ? 'text-indigo-600' : 'hover:text-indigo-600'} transition-colors`}>Assessment</Link>
                <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-indigo-600' : 'hover:text-indigo-600'} transition-colors`}>Dashboard</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Hi, {user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/" className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 pb-20 px-4">
        {children}
      </main>

      <footer className="max-w-6xl mx-auto py-12 px-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm">
        <div className="flex items-center gap-2 font-bold text-slate-600">
          <Heart size={16} fill="currentColor" />
          PregaCare AI
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
        </div>
        <div>© 2026 PregaCare Technologies India.</div>
      </footer>
    </div>
  );
};

export default Layout;
