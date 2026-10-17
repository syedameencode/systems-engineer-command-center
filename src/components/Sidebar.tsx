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
  Plus,
  Terminal,
  Cpu,
  Flame,
  ShieldCheck,
  HardDriveDownload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateTodayStats, formatMinutes } from '../utils/calculations';

interface SidebarProps {
  onOpenQuickAdd: () => void;
  onOpenCommandPalette: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd, onOpenCommandPalette }) => {
  const { state, isDemoMode, timer } = useApp();
  const todayStats = calculateTodayStats(state.tasks, state.sessions, state.settings.dailyStudyGoalMinutes);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/roadmap', label: 'My Roadmap', icon: Map, badge: '5 Phases' },
    {
      to: '/tasks',
      label: "Today's Tasks",
      icon: CheckSquare,
      badge: todayStats.pendingCount > 0 ? `${todayStats.pendingCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      to: '/study-timer',
      label: 'Study Timer',
      icon: Timer,
      badge: timer.isRunning ? `${Math.floor(timer.timeLeft / 60)}m` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse',
    },
    { to: '/projects', label: 'Projects', icon: FolderGit2, badge: '4 Flagships' },
    { to: '/resources', label: 'Courses & Resources', icon: BookOpen },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/internships', label: 'Internship Tracker', icon: Briefcase },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none backdrop-blur-md sticky top-0 z-30 transition-all">
      {/* Top Header / Branding */}
      <div>
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-mono font-bold text-sm">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
                  SYSTEMS<span className="text-cyan-400">//</span>CMD
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-tight">ENGINEER CENTER</div>
              </div>
            </div>

            <div
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isDemoMode
                  ? 'bg-slate-800/80 text-cyan-300 border-slate-700'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              }`}
              title={isDemoMode ? 'Local-First Mode (Storage in browser)' : 'Connected to Cloud'}
            >
              {isDemoMode ? (
                <>
                  <HardDriveDownload className="w-2.5 h-2.5 text-cyan-400" />
                  LOCAL
                </>
              ) : (
                <>
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  CLOUD
                </>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick-Add Task</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-normal ${
                    item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Status Card */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
        {/* Command shortcut hint */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full mb-3 flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition-all cursor-pointer font-mono"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cyan-400" />
            Quick Command
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* User Target Card */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-200">CS Year 2 · Semester {state.settings.currentSemester}</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
              <Flame className="w-3 h-3 text-amber-400" />
              {todayStats.goalProgress}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, todayStats.goalProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400 font-mono">
            <span>{formatMinutes(todayStats.minutesStudied)} logged</span>
            <span>Target: {formatMinutes(state.settings.dailyStudyGoalMinutes)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
