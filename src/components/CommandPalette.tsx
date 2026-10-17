import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
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
  Play,
  X,
  Code,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenQuickAdd }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { startTimer, state } = useApp();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'quick-add',
      title: 'Create New Task',
      subtitle: 'Add a new learning item to your daily schedule',
      category: 'Actions',
      icon: Plus,
      run: () => {
        onClose();
        onOpenQuickAdd();
      },
    },
    {
      id: 'start-timer',
      title: 'Start Focus Session (25 min)',
      subtitle: 'Launch deep-work pomodoro focus mode',
      category: 'Actions',
      icon: Play,
      run: () => {
        onClose();
        startTimer();
        navigate('/study-timer');
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Overview of progress, daily tasks & streak',
      category: 'Navigation',
      icon: LayoutDashboard,
      run: () => {
        onClose();
        navigate('/');
      },
    },
    {
      id: 'nav-roadmap',
      title: 'Go to My Roadmap',
      subtitle: 'View 5-phase High-Performance Systems blueprint',
      category: 'Navigation',
      icon: Map,
      run: () => {
        onClose();
        navigate('/roadmap');
      },
    },
    {
      id: 'nav-tasks',
      title: 'Go to Today\'s Tasks',
      subtitle: 'Manage and prioritize daily tasks',
      category: 'Navigation',
      icon: CheckSquare,
      run: () => {
        onClose();
        navigate('/tasks');
      },
    },
    {
      id: 'nav-timer',
      title: 'Go to Study Timer',
      subtitle: 'Full-screen focus timer with task logging',
      category: 'Navigation',
      icon: Timer,
      run: () => {
        onClose();
        navigate('/study-timer');
      },
    },
    {
      id: 'nav-projects',
      title: 'Go to Flagship Projects',
      subtitle: 'MyVector, Lock-Free SPSC, Order Book, CUDA Engine',
      category: 'Navigation',
      icon: FolderGit2,
      run: () => {
        onClose();
        navigate('/projects');
      },
    },
    {
      id: 'nav-resources',
      title: 'Go to Courses & Resources',
      subtitle: 'Search LearnCpp, CSES, OSTEP, Nand2Tetris & CUDA docs',
      category: 'Navigation',
      icon: BookOpen,
      run: () => {
        onClose();
        navigate('/resources');
      },
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics & Metrics',
      subtitle: 'Study time charts, category splits & streak tracking',
      category: 'Navigation',
      icon: BarChart3,
      run: () => {
        onClose();
        navigate('/analytics');
      },
    },
    {
      id: 'nav-internships',
      title: 'Go to Internship Tracker',
      subtitle: 'Career pipeline for ADIA, Citadel, Tadawul, NVIDIA',
      category: 'Navigation',
      icon: Briefcase,
      run: () => {
        onClose();
        navigate('/internships');
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Daily study goals, export/import JSON, Supabase cloud sync',
      category: 'Navigation',
      icon: Settings,
      run: () => {
        onClose();
        navigate('/settings');
      },
    },
  ];

  // Add tasks matching query
  const taskActions = state.tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `Task: ${t.category} · Priority: ${t.priority} · ${t.completed ? 'Completed' : 'Pending'}`,
      category: 'Tasks',
      icon: CheckSquare,
      run: () => {
        onClose();
        navigate('/tasks');
      },
    }));

  const filtered = query.trim() === '' ? actions : [...actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.subtitle.toLowerCase().includes(query.toLowerCase())), ...taskActions];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].run();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden font-sans">
        {/* Search Input */}
        <div className="relative border-b border-slate-800 flex items-center px-4 py-3 bg-slate-950/40">
          <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, pages, or tasks..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or tasks found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-cyan-400">Systems Engineer Command Center</span>
        </div>
      </div>
    </div>
  );
};
