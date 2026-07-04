import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  BookOpen, 
  ShoppingBag, 
  Database, 
  FolderHeart, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useActiveUser } from './UserContext';

export default function AcademicsLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { activeUser, loading } = useActiveUser();

  const navItems = [
    { name: 'Marketplace', href: '/academics/marketplace', icon: ShoppingBag, color: '#1d4ed8' },
    { name: 'Digital Vault', href: '/academics/vault', icon: Database, color: '#14b8a6' },
    { name: 'My Inventory', href: '/academics/inventory', icon: FolderHeart, color: '#0f4c81' },
    { name: 'Settings', href: '/academics/settings', icon: Settings, color: '#64748b' },
  ];

  return (
    <div className="flex h-screen bg-[#fafafc] overflow-hidden text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-xl border-r border-blue-900/[0.05] z-20">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-900/[0.05]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 shadow-lg shadow-blue-500/10">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none bg-gradient-to-r from-blue-900 to-teal-700 bg-clip-text text-transparent">UniHub</h1>
            <span className="text-xs text-slate-400 font-medium">Academics Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-900 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-blue-700'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-900' : 'text-slate-400 group-hover:text-blue-600'}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Quick link to go back to Main Portal */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50/60 hover:text-rose-700 transition-all duration-300 mt-8"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Portal
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#fafafc]">
        <header className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-blue-900/[0.05] z-10">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {navItems.find((n) => pathname === n.href)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {activeUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-blue-900/[0.05] rounded-xl text-xs shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-700 font-semibold">{activeUser.name}</span>
                <span className="text-slate-400">({activeUser.branch})</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#fafafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
