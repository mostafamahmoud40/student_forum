import { Link, useNavigate } from '@tanstack/react-router';
import { GraduationCap, LogOut, LayoutDashboard, Settings, MessageSquare, Home, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  // Sync role from localStorage on mount and periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('userRole'));
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    // Set a short interval to check for changes since TanStack navigate doesn't trigger standard storage events
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setRole(null);
    navigate({ to: '/login' });
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100/80 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[3.75rem]">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <GraduationCap className="w-7 h-7 text-primary" />
              <span className="text-xl font-extrabold text-slate-900 tracking-tight hidden sm:block">StudentHub</span>
            </Link>

            {/* Navigation links */}
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className="[&.active]:bg-blue-50 [&.active]:text-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                to="/communities"
                className="[&.active]:bg-blue-50 [&.active]:text-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                Communities
              </Link>
              <Link
                to="/discussions"
                className="[&.active]:bg-blue-50 [&.active]:text-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Discussions
              </Link>

              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="[&.active]:bg-blue-50 [&.active]:text-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              {role === 'student' && (
                <Link
                  to="/student/my-communities"
                  className="[&.active]:bg-blue-50 [&.active]:text-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Student Portal
                </Link>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {role ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 pl-1">
                  <img
                    className="w-8 h-8 rounded-full ring-1 ring-slate-100 object-cover"
                    src={role === 'admin' ? 'https://i.pravatar.cc/100?img=33' : 'https://i.pravatar.cc/100?img=12'}
                    alt="Profile"
                  />
                  <div className="hidden md:block text-left leading-none">
                    <p className="text-[13px] font-bold text-slate-800">
                      {role === 'admin' ? 'Dr. Khaled Salem' : 'Ahmed Mohammed'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                      {role === 'admin' ? 'Admin' : 'Student'}
                    </p>
                  </div>
                </div>

                <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}