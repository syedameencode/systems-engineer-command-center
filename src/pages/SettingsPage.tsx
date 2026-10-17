import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Clock,
  Globe,
  Bell,
  Sun,
  Moon,
  Timer,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  HardDriveDownload,
  Cloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPABASE_SQL_SCHEMA } from '../services/supabase';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SettingsPage: React.FC = () => {
  const {
    state,
    updateSettings,
    exportData,
    importData,
    resetToDefaults,
    isDemoMode,
    cloudSyncAvailable,
  } = useApp();

  const [dailyGoal, setDailyGoal] = useState(state.settings.dailyStudyGoalMinutes);
  const [timezone, setTimezone] = useState(state.settings.timezone);
  const [reminderTime, setReminderTime] = useState(state.settings.reminderTime);
  const [theme, setTheme] = useState(state.settings.theme);

  // Pomodoro settings
  const [focusDuration, setFocusDuration] = useState(state.settings.pomodoro.focusDuration);
  const [shortBreak, setShortBreak] = useState(state.settings.pomodoro.shortBreakDuration);
  const [longBreak, setLongBreak] = useState(state.settings.pomodoro.longBreakDuration);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(
    state.settings.pomodoro.sessionsBeforeLongBreak
  );
  const [autoStartBreaks, setAutoStartBreaks] = useState(state.settings.pomodoro.autoStartBreaks);

  // Cloud credentials
  const [supabaseUrl, setSupabaseUrl] = useState(state.settings.supabaseConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(state.settings.supabaseConfig.anonKey || '');
  const [useCloud, setUseCloud] = useState(state.settings.supabaseConfig.useCloud || false);

  // Modal / Feedback states
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      dailyStudyGoalMinutes: Number(dailyGoal) || 120,
      timezone,
      reminderTime,
      theme,
      pomodoro: {
        focusDuration: Number(focusDuration) || 25,
        shortBreakDuration: Number(shortBreak) || 5,
        longBreakDuration: Number(longBreak) || 15,
        sessionsBeforeLongBreak: Number(sessionsBeforeLong) || 4,
        autoStartBreaks,
      },
      supabaseConfig: {
        url: supabaseUrl.trim(),
        anonKey: supabaseKey.trim(),
        useCloud: Boolean(useCloud && supabaseUrl.trim() && supabaseKey.trim()),
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportJson = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `systems-command-center-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setImportStatus({ success: true, message: 'Data imported and restored successfully!' });
      } else {
        setImportStatus({ success: false, message: res.error || 'Failed to import JSON data.' });
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
            ENGINEERING PREFERENCES & PERSISTENCE
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Application Settings</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure your daily study targets, timer defaults, local JSON backup/restore, and optional Supabase cloud synchronization.
          </p>
        </div>

        {/* Persistence Status pill */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 self-start md:self-auto">
          {isDemoMode ? (
            <>
              <HardDriveDownload className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-cyan-300 font-mono">LOCAL-FIRST MODE</div>
                <div className="text-[10px] text-slate-400">Saved in browser localStorage</div>
              </div>
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-emerald-300 font-mono">CLOUD SYNCED</div>
                <div className="text-[10px] text-slate-400">Connected to Supabase PostgreSQL</div>
              </div>
            </>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4" />
          <span>Settings successfully saved!</span>
        </div>
      )}

      {importStatus && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium border ${
            importStatus.success
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {importStatus.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Study Target & Timezone Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Study Target & Regional Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Daily Study Target (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="720"
                step="15"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard pace: 120 minutes/day (2 hours deliberate practice)
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Used for streak calculations and daily boundary resets
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Daily Study Reminder Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                In-app notification prompt time
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Theme</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono border transition-all ${
                    theme === 'dark'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono border transition-all ${
                    theme === 'light'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Light Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Study Timer Configuration Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>Study Timer (Pomodoro) Durations</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Focus (mins)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Short Break (mins)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Long Break (mins)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Sessions before Long Break</label>
              <input
                type="number"
                min="1"
                max="10"
                value={sessionsBeforeLong}
                onChange={(e) => setSessionsBeforeLong(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Data Persistence: Backup & Restore */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Data Backup & Restoration</span>
          </h3>
          <p className="text-xs text-slate-400">
            Export a full JSON backup of all your tasks, roadmap progress, project milestones, benchmarks, and focus logs.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Import JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-mono border border-rose-900/60 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Seed Defaults</span>
            </button>
          </div>
        </div>

        {/* Supabase PostgreSQL Cloud Sync Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Supabase PostgreSQL Cloud Integration</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Optional Cloud Sync
            </span>
          </div>

          <p className="text-xs text-slate-400">
            When configured, your roadmap and daily tasks synchronize to a secure Supabase PostgreSQL instance with Row-Level Security (RLS). When empty or unconfigured, the app runs in 100% offline local-first mode.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Supabase Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Supabase Anon Key</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Copy SQL Migration Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Need database tables? Copy our ready-to-run PostgreSQL schema migration:
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL Schema'}</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 cursor-pointer transition-all"
          >
            Save All Preferences
          </button>
        </div>
      </form>

      {/* Confirmation Modal for Reset Defaults */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset Application Data"
        message="Are you sure you want to restore the default seed data? Any custom tasks or notes created will be replaced with initial roadmap data."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={() => {
          resetToDefaults();
          setShowResetConfirm(false);
        }}
        onClose={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
