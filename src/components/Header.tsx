import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Plus,
  Sun,
  Moon,
  Timer,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMinutes } from '../utils/calculations';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenCommandPalette: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickAdd,
  onOpenCommandPalette,
  onToggleMobileNav,
}) => {
  const { state, timer, markNotificationRead, markAllNotificationsRead, clearAllNotifications, updateSettings } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Greeting Banner */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 m-0 font-sans">
              <span>{getGreeting()}, Engineer</span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </h1>
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {todayFormatted}
            </span>
          </div>
          <p className="text-[11px] text-cyan-400 font-medium hidden sm:block tracking-wide">
            Target: High-Performance Systems & AI Infrastructure
          </p>
        </div>
      </div>

      {/* Right: Quick actions, Live Timer, Notifications, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Timer Pill (visible if running) */}
        {timer.isRunning && (
          <button
            onClick={() => navigate('/study-timer')}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono animate-pulse hover:bg-cyan-900/50 cursor-pointer transition-all"
            title="Active Focus Session running - Click to open timer"
          >
            <Timer className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>
              {String(Math.floor(timer.timeLeft / 60)).padStart(2, '0')}:
              {String(timer.timeLeft % 60).padStart(2, '0')}
            </span>
          </button>
        )}

        {/* Command Search button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">Search commands...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-cyan-950 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title={`Switch to ${state.settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {state.settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Notification Center Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center font-mono ring-2 ring-slate-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden font-sans">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {state.notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-300 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {state.notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-slate-600 mb-2" />
                    <p>All caught up! No notifications right now.</p>
                  </div>
                ) : (
                  state.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) {
                          setShowNotifications(false);
                          navigate(notif.link);
                        }
                      }}
                      className={`p-3 text-xs hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'milestone' ? (
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        ) : notif.type === 'daily' ? (
                          <Timer className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${!notif.read ? 'text-slate-100' : 'text-slate-300'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
