import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { GraduationCap, ShieldAlert, Users, MessageSquare, Settings, LogOut, Bell, Search, Menu, X, User } from 'lucide-react'
import { auth } from '../lib/api'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [alertsCount] = useState(4)
  const currentUser = auth.currentUser()

  const handleLogout = () => {
    auth.clearSession()
    navigate({ to: '/login' })
  }

  const sidebarLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: Settings },
    { to: '/admin/communities', label: 'Manage Communities', icon: Users },
    { to: '/admin/discussions', label: 'Manage Discussions', icon: MessageSquare },
    { to: '/admin/moderation', label: 'Moderation Queue', icon: ShieldAlert },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-blue-400" />
          <span className="font-extrabold text-xl tracking-tight">StudentHub Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {alertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar overlay menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-950/60 z-30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside 
            className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-slate-300 flex flex-col p-6 shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-8 text-white">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              <span className="font-extrabold text-xl tracking-tight">StudentHub Admin</span>
            </div>

            <nav className="space-y-1.5 flex-grow">
              {sidebarLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-semibold text-sm transition-all [&.active]:bg-blue-600 [&.active]:text-white"
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-950/20 font-semibold text-sm transition-all border border-transparent hover:border-rose-900 mt-auto"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-white border-r border-slate-200 text-slate-700 flex-col px-4 py-6 fixed top-0 bottom-0 left-0 z-20">
        <div className="flex items-center gap-3 mb-8 px-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">StudentHub Admin</span>
        </div>

        <nav className="space-y-1 flex-grow">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">Control Center</div>
          {sidebarLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors [&.active]:bg-blue-50 [&.active]:text-primary [&.active]:font-bold"
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-medium text-sm transition-colors mt-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow lg:pl-64 flex flex-col min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-20 bg-white border-b border-slate-200 px-10 items-center justify-between sticky top-0 z-10">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text" 
              placeholder="Search students, flags, logs..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5 text-rose-700 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{alertsCount} Flagged Items</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-2 rounded-2xl transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{currentUser?.name ?? 'Admin'}</p>
                  <p className="text-[10px] font-bold text-slate-400">@{currentUser?.email?.split('@')[0] ?? 'admin'}</p>
                </div>
                <img 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200" 
                  src="https://i.pravatar.cc/100?img=33" 
                  alt="Admin avatar" 
                />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-20 py-2 origin-top-right animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 sm:hidden mb-1">
                      <p className="text-sm font-bold text-slate-900">{currentUser?.name ?? 'Admin'}</p>
                      <p className="text-[10px] font-bold text-slate-400">@{currentUser?.email?.split('@')[0] ?? 'admin'}</p>
                    </div>

                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors cursor-pointer">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    
                    <div className="h-px bg-slate-100 my-1.5"></div>
                    
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
