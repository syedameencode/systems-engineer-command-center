import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Play,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  FolderGit2,
  Cpu,
  Target,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  calculateTodayStats,
  calculateStreak,
  calculateOverallRoadmapProgress,
  calculatePhaseProgress,
  formatMinutes,
  formatDisplayDate,
  getLocalDateString,
} from '../utils/calculations';

interface DashboardPageProps {
  onOpenQuickAdd: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenQuickAdd }) => {
  const { state, startTimer, setTimerMode, toggleTaskComplete } = useApp();
  const navigate = useNavigate();

  const todayStr = getLocalDateString();
  const todayStats = calculateTodayStats(state.tasks, state.sessions, state.settings.dailyStudyGoalMinutes);
  const { currentStreak, longestStreak } = calculateStreak(state.studyLogs);
  const overallProgress = calculateOverallRoadmapProgress(state.phases, state.projects);

  // Active Phase is Phase 1 (Semester 3) by default or currentSemester
  const activePhase = state.phases.find((p) => p.id === 1) || state.phases[0];
  const activePhaseProgress = activePhase ? calculatePhaseProgress(activePhase, state.projects) : 0;

  // Next unfinished item for "Continue Learning"
  const pendingTasksToday = state.tasks.filter((t) => !t.completed && t.dueDate === todayStr);
  const nextUnfinishedTask = pendingTasksToday[0] || state.tasks.find((t) => !t.completed);
  const nextUnfinishedMilestone = activePhase?.milestones.find((m) => !m.completed);

  // Weekly study hours chart data (last 7 days)
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const log = state.studyLogs[dStr];
    const minutes = log?.minutesStudied || 0;
    const hours = Number((minutes / 60).toFixed(1));
    return {
      date: dStr,
      day: dayName,
      hours,
      minutes,
      isToday: dStr === todayStr,
    };
  });

  // Start Focus Session Handler
  const handleStartFocus = () => {
    setTimerMode('focus', 25);
    startTimer();
    navigate('/study-timer');
  };

  // Continue Learning Handler
  const handleContinueLearning = () => {
    if (nextUnfinishedTask) {
      navigate('/tasks');
    } else {
      navigate('/roadmap');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Objective Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              SYSTEMS & AI INFRASTRUCTURE BLUEPRINT · SEMESTER 3
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Systems Engineer Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Master raw memory, lock-free concurrency, low-latency matching engines, and CUDA kernels to bypass campus filters for sovereign wealth funds, national exchanges, and frontier AI labs.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={handleStartFocus}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus Session</span>
            </button>
            <button
              onClick={handleContinueLearning}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Tasks Completed */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{todayStats.completedCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {todayStats.totalTodayCount} due</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{todayStats.pendingCount} remaining</span>
            <span className="text-cyan-400 font-mono">
              {todayStats.totalTodayCount > 0
                ? `${Math.round((todayStats.completedCount / todayStats.totalTodayCount) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Study Time Today */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Study Time Today</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{formatMinutes(todayStats.minutesStudied)}</span>
            <span className="text-xs text-slate-400 font-mono">/ {formatMinutes(todayStats.goalMinutes)}</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, todayStats.goalProgress)}%` }}
            />
          </div>
        </div>

        {/* Current Study Streak */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{currentStreak}</span>
            <span className="text-xs text-slate-400 font-mono">days</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Best: {longestStreak} days</span>
            <span className="text-amber-400/90 font-mono">2h daily pace</span>
          </div>
        </div>

        {/* Overall Roadmap Completion */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Roadmap Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-300">{overallProgress}%</span>
            <span className="text-xs text-slate-400 font-mono">weighted</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Learning Plan & Semester / Phase Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Learning Plan & Weekly Study Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Learning Plan */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>Today's Learning Plan</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {todayStats.pendingCount} to go
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">High-priority items targeted for today</p>
              </div>
              <button
                onClick={onOpenQuickAdd}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                + Add Task
              </button>
            </div>

            {/* Task list */}
            <div className="space-y-2.5">
              {state.tasks.filter((t) => t.dueDate === todayStr).length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center">
                  <p className="text-xs text-slate-400">No tasks specifically scheduled for today.</p>
                  <button
                    onClick={onOpenQuickAdd}
                    className="mt-2 text-xs text-cyan-400 hover:underline cursor-pointer font-medium"
                  >
                    Add a task or pick from Phase 1 milestones
                  </button>
                </div>
              ) : (
                state.tasks
                  .filter((t) => t.dueDate === todayStr)
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                        task.completed
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            task.completed
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                              : 'border-slate-700 hover:border-cyan-400 bg-slate-900'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div
                            className={`text-xs font-medium ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {task.category}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                task.priority === 'High'
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimatedMinutes}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTimerMode('focus', task.estimatedMinutes || 25);
                          startTimer();
                          navigate('/study-timer');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Focus on this task with timer"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Weekly Study Hours Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Weekly Study Consistency</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hours logged per day vs 2h/day target</p>
              </div>
              <div className="text-xs font-mono text-cyan-400">
                Avg: {(last7DaysData.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)} hrs/day
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => [`${val} hours`, 'Study Time']}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {last7DaysData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? '#38bdf8' : entry.hours >= 2 ? '#34d399' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Phase, Career Goals, Flagship Project */}
        <div className="space-y-6">
          {/* Active Phase Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-400 font-semibold">{activePhase.semester}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-100">{activePhaseProgress}%</span>
            </div>

            <h4 className="text-sm font-semibold text-slate-100">{activePhase.title}</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{activePhase.targetGoal}</p>

            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${activePhaseProgress}%` }}
              />
            </div>

            {/* Next Unfinished Milestone */}
            {nextUnfinishedMilestone && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  NEXT TARGET MILESTONE
                </div>
                <div className="text-xs text-slate-200 mt-1 font-medium leading-snug">
                  {nextUnfinishedMilestone.title}
                </div>
                {nextUnfinishedMilestone.targetDate && (
                  <div className="mt-1.5 text-[10px] font-mono text-slate-400">
                    Target: {formatDisplayDate(nextUnfinishedMilestone.targetDate)}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/roadmap')}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              <span>Explore Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Milestone Progress */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>Flagship Projects</span>
              </h4>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {state.projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate('/projects')}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-slate-200 mb-1">
                    <span className="line-clamp-1">{proj.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2">
                      {proj.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-1 rounded-full transition-all"
                      style={{ width: `${proj.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-400">
                    <span>{proj.semester}</span>
                    <span
                      className={
                        proj.status === 'In Progress'
                          ? 'text-cyan-400'
                          : proj.status === 'Completed'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {proj.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Firms Radar / Career Compass */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Target Engineering Firms</span>
              </h4>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              High-performance systems engineering tracks (100% Halal Sovereign Wealth Funds, National Exchanges & AI Labs)
            </p>

            <div className="space-y-2">
              {[
                { name: 'ADIA / Sanabil', type: 'Sovereign Wealth Funds', focus: 'Low-Latency Research Infra' },
                { name: 'Tadawul & NSE', type: 'Securities Exchanges', focus: 'Sub-2µs Matching Engine' },
                { name: 'NVIDIA & Scale AI', type: 'Frontier AI Labs', focus: 'CUDA Kernels & Inference' },
                { name: 'Citadel / Jane Street', type: 'Quantitative Trading', focus: 'Ultra-Fast C++20 Systems' },
              ].map((firm, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{firm.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{firm.type}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                    {firm.focus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
