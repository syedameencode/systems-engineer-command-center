import React, { useState } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Maximize2,
  Minimize2,
  Coffee,
  Brain,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMinutes, sendBrowserNotification } from '../utils/calculations';
import { TaskCategory } from '../types';

const CATEGORIES: TaskCategory[] = ['C++', 'DSA', 'Systems', 'AI', 'Projects', 'Career', 'College'];

export const StudyTimerPage: React.FC = () => {
  const {
    timer,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerMode,
    setActiveTimerTask,
    finishTimerSessionEarly,
    state,
    updateSettings,
  } = useApp();

  const [isZenMode, setIsZenMode] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('45');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const minutes = Math.floor(timer.timeLeft / 60);
  const seconds = timer.timeLeft % 60;
  const progressPercent = timer.totalDuration > 0 ? ((timer.totalDuration - timer.timeLeft) / timer.totalDuration) * 100 : 0;

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ browserNotificationsEnabled: true });
        sendBrowserNotification('Notifications Enabled! 🎯', {
          body: 'You will receive desktop alerts when focus and break sessions finish.',
        });
      }
    }
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !state.settings.soundEnabled });
  };

  // Sessions completed today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const sessionsToday = state.sessions.filter(
    (s) => s.startTime.startsWith(todayDateStr) && s.type === 'focus'
  );
  const totalFocusMinutesToday = sessionsToday.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div
      className={`font-sans transition-all ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto'
          : 'space-y-6 max-w-5xl mx-auto pb-12'
      }`}
    >
      {/* Zen Mode Header */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider">
              DEEP FOCUS ZEN MODE · SYSTEMS ENGINEER
            </span>
          </div>
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* Main Standard Header */}
      {!isZenMode && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
              <TimerIcon className="w-3.5 h-3.5 text-cyan-400" />
              POMODORO & DEEP SYSTEMS FOCUS MODE
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Study Focus Timer</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Structured uninterrupted focus blocks. Time logged here immediately updates your daily 120-minute goal and linked tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZenMode(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>Zen Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Console Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        {/* Mode Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-8 max-w-md w-full">
          <button
            onClick={() => setTimerMode('focus', 25)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              timer.mode === 'focus'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => setTimerMode('short-break', 5)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              timer.mode === 'short-break'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setTimerMode('long-break', 15)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              timer.mode === 'long-break'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break (15m)
          </button>
          <button
            onClick={() => setShowCustomModal(true)}
            className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              timer.mode === 'custom'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Circular Countdown Progress Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`transition-all duration-1000 ${
                timer.mode === 'focus' || timer.mode === 'custom'
                  ? 'text-cyan-400'
                  : timer.mode === 'short-break'
                  ? 'text-emerald-400'
                  : 'text-indigo-400'
              }`}
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time & Mode Display Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-100 select-none">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="mt-2 text-xs font-mono font-medium uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              {timer.mode === 'focus' || timer.mode === 'custom' ? (
                <>
                  <Brain className="w-3.5 h-3.5" />
                  <span>Deep Work</span>
                </>
              ) : (
                <>
                  <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Rest & Recovery</span>
                </>
              )}
            </div>

            {timer.activeTaskTitle && (
              <div className="mt-1 text-[11px] text-slate-400 max-w-[200px] truncate">
                {timer.activeTaskTitle}
              </div>
            )}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset timer to beginning"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!timer.isRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full text-sm font-bold shadow-lg shadow-cyan-950 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Focus</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-sm font-bold shadow-lg shadow-amber-950 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}

          {timer.timeLeft < timer.totalDuration && (
            <button
              onClick={finishTimerSessionEarly}
              className="p-3 rounded-full bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              title="Finish session early and log minutes"
            >
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Task & Category Association Dropdowns */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Associated Task */}
          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Link to Active Task:
            </label>
            <select
              value={timer.activeTaskId || ''}
              onChange={(e) => {
                const taskId = e.target.value;
                if (!taskId) {
                  setActiveTimerTask(undefined, undefined, timer.activeCategory);
                } else {
                  const t = state.tasks.find((task) => task.id === taskId);
                  if (t) {
                    setActiveTimerTask(t.id, t.title, t.category);
                  }
                }
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">None (General Systems Focus)</option>
              {state.tasks
                .filter((t) => !t.completed)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.category}] {t.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Category */}
          <div className="w-full sm:w-36">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Category:</label>
            <select
              value={timer.activeCategory}
              onChange={(e) => setActiveTimerTask(timer.activeTaskId, timer.activeTaskTitle, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sound & Notification Quick Toggles */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer"
            title="Toggle session completion sound"
          >
            {state.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span>Sound {state.settings.soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <span className="text-slate-700">·</span>

          <button
            onClick={handleRequestNotificationPermission}
            className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer"
            title="Enable browser notifications"
          >
            <Bell
              className={`w-4 h-4 ${
                state.settings.browserNotificationsEnabled ? 'text-cyan-400' : 'text-slate-500'
              }`}
            />
            <span>
              {state.settings.browserNotificationsEnabled ? 'Notifications Active' : 'Enable Notifications'}
            </span>
          </button>
        </div>
      </div>

      {/* Completed Sessions Log Today */}
      {!isZenMode && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Focus Sessions Logged Today</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  {sessionsToday.length} completed
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Focus Today: {formatMinutes(totalFocusMinutesToday)}
              </p>
            </div>
          </div>

          {sessionsToday.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No sessions completed yet today. Start a 25-minute focus session to log study time!
            </div>
          ) : (
            <div className="space-y-2">
              {sessionsToday.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">
                        {sess.taskTitle || `${sess.category} Deliberate Practice`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                      {sess.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-100">
                      +{sess.durationMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">Set Custom Focus Time</h4>
            <p className="text-xs text-slate-400 mb-4">Enter session duration in minutes:</p>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutesInput}
              onChange={(e) => setCustomMinutesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-center text-lg font-bold mb-4 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const mins = parseInt(customMinutesInput, 10);
                  if (mins > 0) {
                    setTimerMode('custom', mins);
                    setShowCustomModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
