import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  CheckSquare,
  Timer,
  FolderGit2,
  BookOpen,
  BarChart3,
  Briefcase,
  Settings,
  X,
  Cpu,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, onOpenQuickAdd }) => {
  const { isDemoMode, timer } = useApp();

  if (!isOpen) return null;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/roadmap', label: 'My Roadmap', icon: Map },
    { to: '/tasks', label: "Today's Tasks", icon: CheckSquare },
    {
      to: '/study-timer',
      label: 'Study Timer',
      icon: Timer,
      badge: timer.isRunning ? 'Active' : undefined,
    },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/resources', label: 'Courses & Resources', icon: BookOpen },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/internships', label: 'Internship Tracker', icon: Briefcase },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] h-full bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">
                SYSTEMS<span className="text-cyan-400">//</span>CMD
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add */}
          <button
            onClick={() => {
              onClose();
              onOpenQuickAdd();
            }}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950"
          >
            <Plus className="w-4 h-4" />
            <span>Quick-Add Task</span>
          </button>

          {/* Nav Links */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          <div>Mode: {isDemoMode ? 'Local-First Demo' : 'Cloud Sync'}</div>
          <div className="text-cyan-400 mt-1">CS Year 2 · Semester 3 Base</div>
        </div>
      </div>
    </div>
  );
};
