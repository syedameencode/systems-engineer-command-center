import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  Play,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  ArrowUpDown,
  Layers,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, Priority } from '../types';
import {
  getLocalDateString,
  formatMinutes,
  formatDisplayDate,
  calculateTodayStats,
} from '../utils/calculations';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface TaskManagerPageProps {
  onOpenQuickAdd: (taskToEdit?: Task) => void;
}

const CATEGORIES: (TaskCategory | 'All')[] = [
  'All',
  'C++',
  'DSA',
  'Systems',
  'AI',
  'Projects',
  'Career',
  'College',
];

const PRIORITIES: (Priority | 'All')[] = ['All', 'High', 'Medium', 'Low'];

export const TaskManagerPage: React.FC<TaskManagerPageProps> = ({ onOpenQuickAdd }) => {
  const { state, toggleTaskComplete, deleteTask, rescheduleTask, startTimer, setTimerMode, setActiveTimerTask } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'overdue' | 'completed' | 'pending'>('today');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'estimatedMinutes' | 'title'>('priority');

  // Deletion modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Reschedule state
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(getLocalDateString());

  const todayStr = getLocalDateString();
  const todayStats = calculateTodayStats(state.tasks, state.sessions, state.settings.dailyStudyGoalMinutes);

  // Filter tasks
  const filteredTasks = state.tasks.filter((task) => {
    // Search query
    if (searchQuery.trim() !== '') {
      const match =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'All' && task.category !== selectedCategory) {
      return false;
    }

    // Priority
    if (selectedPriority !== 'All' && task.priority !== selectedPriority) {
      return false;
    }

    // Status Filter
    if (statusFilter === 'today') {
      return task.dueDate === todayStr;
    } else if (statusFilter === 'overdue') {
      return !task.completed && task.dueDate < todayStr;
    } else if (statusFilter === 'completed') {
      return task.completed;
    } else if (statusFilter === 'pending') {
      return !task.completed;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pWeights = { High: 3, Medium: 2, Low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    if (sortBy === 'dueDate') {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'estimatedMinutes') {
      return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
    }
    return a.title.localeCompare(b.title);
  });

  const overdueCount = state.tasks.filter((t) => !t.completed && t.dueDate < todayStr).length;

  const handleStartTimerForTask = (task: Task) => {
    setActiveTimerTask(task.id, task.title, task.category);
    setTimerMode('focus', task.estimatedMinutes || 25);
    startTimer();
    navigate('/study-timer');
  };

  const handleConfirmReschedule = (taskId: string) => {
    rescheduleTask(taskId, rescheduleDate);
    setReschedulingTaskId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner & Goal Progress */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              DAILY SYSTEMS EXECUTION LOG
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Daily Task Manager</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Turn your high-performance systems engineering blueprint into daily 2-hour deliberate practice sessions.
            </p>
          </div>

          {/* Daily 120-minute goal card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
              <span>Daily Goal Progress</span>
              <span className="text-cyan-400 font-bold">{todayStats.goalProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, todayStats.goalProgress)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatMinutes(todayStats.minutesStudied)} studied</span>
              <span>Target: {formatMinutes(todayStats.goalMinutes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Filter Tabs & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: "Today's Tasks", count: state.tasks.filter((t) => t.dueDate === todayStr).length },
              { id: 'overdue', label: 'Overdue', count: overdueCount, alert: overdueCount > 0 },
              { id: 'pending', label: 'All Incomplete', count: state.tasks.filter((t) => !t.completed).length },
              { id: 'completed', label: 'Completed', count: state.tasks.filter((t) => t.completed).length },
              { id: 'all', label: 'All Tasks', count: state.tasks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    tab.alert
                      ? 'bg-rose-500/20 text-rose-300 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenQuickAdd()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Search, Category, Priority & Sort Row */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by name or description..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="estimatedMinutes">Sort by Duration</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No tasks found</h4>
            <p className="text-xs text-slate-500 mt-1">
              No tasks matched your current filter criteria or query.
            </p>
            <button
              onClick={() => onOpenQuickAdd()}
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              + Create New Task
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const isOverdue = !task.completed && task.dueDate < todayStr;
            const isToday = task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isOverdue
                    ? 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500/60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                          : 'border-slate-700 hover:border-cyan-400 bg-slate-950'
                      }`}
                      title={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isRecurring && (
                          <span
                            className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px]"
                            title="Recurring habit"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Meta Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {task.category}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            task.priority === 'High'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {task.priority} Priority
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 border ${
                            isOverdue
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                              : isToday
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {isOverdue ? 'Overdue: ' : ''}
                          {formatDisplayDate(task.dueDate)}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est: {task.estimatedMinutes}m · Logged: {task.actualMinutes || 0}m
                        </span>

                        {task.phaseId && (
                          <span className="text-[10px] font-mono text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/50 border border-indigo-900/60">
                            Phase {task.phaseId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Focus, Reschedule, Edit, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Launch Focus Timer */}
                    {!task.completed && (
                      <button
                        onClick={() => handleStartTimerForTask(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer transition-all"
                        title="Start timer for this task"
                      >
                        <Play className="w-3 h-3 fill-cyan-300" />
                        <span>Focus</span>
                      </button>
                    )}

                    {/* Reschedule Button */}
                    <button
                      onClick={() => {
                        setReschedulingTaskId(reschedulingTaskId === task.id ? null : task.id);
                        setRescheduleDate(todayStr);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Reschedule task date"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onOpenQuickAdd(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Edit task details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Reschedule Drawer */}
                {reschedulingTaskId === task.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Reschedule to:</span>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    />
                    <button
                      onClick={() => handleConfirmReschedule(task.id)}
                      className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setReschedulingTaskId(null)}
                      className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
};
