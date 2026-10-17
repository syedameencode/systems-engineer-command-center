import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  FolderGit2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  calculateStreak,
  calculateOverallRoadmapProgress,
  calculatePhaseProgress,
  formatMinutes,
  formatDisplayDate,
  getLocalDateString,
} from '../utils/calculations';

const CATEGORY_COLORS: Record<string, string> = {
  'C++': '#38bdf8',
  'DSA': '#818cf8',
  'Systems': '#34d399',
  'AI': '#f472b6',
  'Projects': '#fbbf24',
  'Career': '#a78bfa',
  'College': '#94a3b8',
  'General': '#64748b',
};

export const AnalyticsPage: React.FC = () => {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('7days');

  const { currentStreak, longestStreak, activeDaysCount } = calculateStreak(state.studyLogs);
  const overallRoadmap = calculateOverallRoadmapProgress(state.phases, state.projects);

  const daysCount = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 60;
  const today = new Date();

  // Generate historical days array
  const activityData = Array.from({ length: daysCount }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (daysCount - 1 - idx));
    const dStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    const log = state.studyLogs[dStr];
    const minutes = log?.minutesStudied || 0;
    const hours = Number((minutes / 60).toFixed(1));
    const tasks = log?.tasksCompleted || 0;
    return {
      date: dStr,
      label: dayName,
      hours,
      minutes,
      tasks,
    };
  });

  const totalMinutesInRange = activityData.reduce((sum, d) => sum + d.minutes, 0);
  const totalTasksInRange = activityData.reduce((sum, d) => sum + d.tasks, 0);
  const avgHoursPerDay = (totalMinutesInRange / 60 / daysCount).toFixed(1);

  // Category breakdown calculation strictly from sessions and task actualMinutes
  const categoryMinutesMap: Record<string, number> = {};

  // From sessions
  state.sessions.forEach((sess) => {
    const cat = sess.category || 'General';
    categoryMinutesMap[cat] = (categoryMinutesMap[cat] || 0) + (sess.durationMinutes || 0);
  });

  // From completed tasks
  state.tasks.forEach((t) => {
    if (t.completed && (t.actualMinutes || 0) > 0) {
      categoryMinutesMap[t.category] = (categoryMinutesMap[t.category] || 0) + t.actualMinutes;
    }
  });

  const categoryChartData = Object.entries(categoryMinutesMap)
    .filter(([_, mins]) => mins > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#38bdf8',
    }));

  // Planned vs actual study time:
  const plannedMinutes = state.tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  const actualMinutes = state.tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            STUDY METRICS & SYSTEMS CONSISTENCY
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Learning Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Calculated in real-time strictly from your recorded sessions, task completions, and roadmap milestone verifications.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-center">
          <button
            onClick={() => setDateRange('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              dateRange === '7days'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              dateRange === '30days'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              dateRange === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 4 Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Time in Range</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatMinutes(totalMinutesInRange)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Avg: {avgHoursPerDay} hrs/day
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalTasksInRange}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Across {daysCount} days
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{currentStreak} days</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Best streak: {longestStreak} days
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Roadmap Completion</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">{overallRoadmap}%</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Weighted across 5 phases
          </div>
        </div>
      </div>

      {/* Primary Charts: Daily Study Hours & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Study Time Progression Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Study Time Progression</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hours studied per day</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">2h/day Target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
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
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hoursGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Category Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Time by Engineering Category</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">Focus minutes split</p>

            {categoryChartData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No focus sessions logged yet.
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [`${val} mins`, 'Study Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Legend list */}
          <div className="space-y-1.5 mt-2">
            {categoryChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-400 font-mono">{formatMinutes(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Completion Progress Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Curriculum Phase Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {state.phases.map((phase) => {
            const prog = calculatePhaseProgress(phase, state.projects);
            return (
              <div key={phase.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1">
                  {phase.semester}
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-2">
                  Phase {phase.id}
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span>Weight: {phase.weight}%</span>
                  <span className="text-slate-100 font-bold">{prog}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${prog}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
