import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AppState,
  Task,
  RoadmapPhase,
  Project,
  Resource,
  FocusSession,
  InternshipApplication,
  AppNotification,
  UserSettings,
  DailyStudyLog,
  BenchmarkRecord,
  ApplicationStatus,
  ResourceStatus,
} from '../types';
import { initialAppState } from '../data/initialData';
import { getLocalDateString, playChimeSound, sendBrowserNotification } from '../utils/calculations';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'systems_command_center_state_v1';

export interface TimerState {
  mode: 'focus' | 'short-break' | 'long-break' | 'custom';
  isRunning: boolean;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  activeTaskId?: string;
  activeTaskTitle?: string;
  activeCategory: string;
  sessionStartTime?: number; // timestamp ms
  sessionsCompletedToday: number;
}

interface AppContextType {
  state: AppState;
  isDemoMode: boolean;
  cloudSyncAvailable: boolean;
  // Timer State
  timer: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: 'focus' | 'short-break' | 'long-break' | 'custom', customMinutes?: number) => void;
  setActiveTimerTask: (taskId?: string, taskTitle?: string, category?: string) => void;
  finishTimerSessionEarly: () => void;
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  rescheduleTask: (id: string, newDueDate: string) => void;
  // Roadmap Actions
  toggleTopic: (phaseId: number, topicId: string) => void;
  toggleMilestone: (phaseId: number, milestoneId: string) => void;
  toggleCourse: (phaseId: number, courseId: string) => void;
  updateMilestoneDate: (phaseId: number, milestoneId: string, date: string) => void;
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  toggleProjectStep: (projectId: string, stepId: string) => void;
  addProjectBenchmark: (projectId: string, benchmark: Omit<BenchmarkRecord, 'id'>) => void;
  deleteProjectBenchmark: (projectId: string, benchmarkId: string) => void;
  // Resource Actions
  addResource: (res: Omit<Resource, 'id' | 'createdAt'>) => void;
  updateResource: (res: Resource) => void;
  deleteResource: (id: string) => void;
  setResourceStatus: (id: string, status: ResourceStatus) => void;
  // Session Actions
  logFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  // Internship Actions
  addApplication: (app: Omit<InternshipApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (app: InternshipApplication) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  // Notification Actions
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  // Settings Actions
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  exportData: () => string;
  importData: (jsonData: string) => { success: boolean; error?: string };
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load State from LocalStorage
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version && parsed.tasks && parsed.phases) {
          return parsed as AppState;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved state from localStorage, using initial seed data.', e);
    }
    return initialAppState;
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  // Apply theme class to document body
  useEffect(() => {
    if (state.settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [state.settings.theme]);

  // Timer State with robust timestamp calculation
  const [timer, setTimer] = useState<TimerState>(() => {
    const focusSec = (state.settings.pomodoro?.focusDuration || 25) * 60;
    return {
      mode: 'focus',
      isRunning: false,
      timeLeft: focusSec,
      totalDuration: focusSec,
      activeTaskId: undefined,
      activeTaskTitle: undefined,
      activeCategory: 'C++',
      sessionStartTime: undefined,
      sessionsCompletedToday: 0,
    };
  });

  // Helper to trigger confetti celebration
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Update study log helper
  const updateStudyLog = useCallback(
    (minutes: number, taskCompletedCount: number = 0) => {
      const today = getLocalDateString();
      setState((prev) => {
        const existing = prev.studyLogs[today] || {
          date: today,
          minutesStudied: 0,
          tasksCompleted: 0,
          sessionsCount: 0,
        };

        const updatedLog: DailyStudyLog = {
          date: today,
          minutesStudied: Math.max(0, existing.minutesStudied + minutes),
          tasksCompleted: Math.max(0, existing.tasksCompleted + taskCompletedCount),
          sessionsCount: minutes > 0 ? existing.sessionsCount + 1 : existing.sessionsCount,
        };

        return {
          ...prev,
          studyLogs: {
            ...prev.studyLogs,
            [today]: updatedLog,
          },
        };
      });
    },
    []
  );

  // Complete a focus session and record stats
  const handleSessionComplete = useCallback(
    (completedTimer: TimerState) => {
      const durationMins = Math.round(completedTimer.totalDuration / 60);
      const isFocus = completedTimer.mode === 'focus' || completedTimer.mode === 'custom';

      if (isFocus && durationMins > 0) {
        // Log focus session
        const newSession: FocusSession = {
          id: 'sess-' + Date.now(),
          taskId: completedTimer.activeTaskId,
          taskTitle: completedTimer.activeTaskTitle,
          category: (completedTimer.activeCategory as any) || 'General',
          startTime: new Date().toISOString(),
          durationMinutes: durationMins,
          completed: true,
          type: 'focus',
        };

        setState((prev) => {
          // If a task was linked, increment actualMinutes on that task
          let updatedTasks = prev.tasks;
          if (completedTimer.activeTaskId) {
            updatedTasks = prev.tasks.map((t) =>
              t.id === completedTimer.activeTaskId
                ? { ...t, actualMinutes: (t.actualMinutes || 0) + durationMins, updatedAt: new Date().toISOString() }
                : t
            );
          }

          return {
            ...prev,
            tasks: updatedTasks,
            sessions: [newSession, ...prev.sessions],
          };
        });

        // Add to daily study log
        updateStudyLog(durationMins, 0);

        // Sound & Browser Notification
        if (state.settings.soundEnabled) {
          playChimeSound();
        }
        if (state.settings.browserNotificationsEnabled) {
          sendBrowserNotification('Focus Session Complete! 🎯', {
            body: `You logged ${durationMins} minutes of focused systems engineering work. Great job!`,
          });
        }

        // Add in-app notification
        const newNotif: AppNotification = {
          id: 'notif-' + Date.now(),
          title: 'Focus Session Completed',
          message: `Logged ${durationMins} minutes on ${completedTimer.activeTaskTitle || completedTimer.activeCategory}. Keep pushing!`,
          type: 'daily',
          read: false,
          timestamp: new Date().toISOString(),
          link: '/study-timer',
        };
        setState((prev) => ({ ...prev, notifications: [newNotif, ...prev.notifications] }));
        triggerConfetti();
      } else {
        // Break session finished
        if (state.settings.soundEnabled) playChimeSound();
        if (state.settings.browserNotificationsEnabled) {
          sendBrowserNotification('Break Finished 🔔', {
            body: 'Ready to dive back into systems engineering?',
          });
        }
      }

      // Reset timer to next mode
      setTimer((prev) => {
        let nextMode: 'focus' | 'short-break' | 'long-break' = 'focus';
        let nextDuration = (state.settings.pomodoro?.focusDuration || 25) * 60;
        const newSessionsCompleted = isFocus ? prev.sessionsCompletedToday + 1 : prev.sessionsCompletedToday;

        if (isFocus) {
          const sessionsBeforeLong = state.settings.pomodoro?.sessionsBeforeLongBreak || 4;
          if (newSessionsCompleted % sessionsBeforeLong === 0) {
            nextMode = 'long-break';
            nextDuration = (state.settings.pomodoro?.longBreakDuration || 15) * 60;
          } else {
            nextMode = 'short-break';
            nextDuration = (state.settings.pomodoro?.shortBreakDuration || 5) * 60;
          }
        }

        return {
          ...prev,
          mode: nextMode,
          isRunning: state.settings.pomodoro?.autoStartBreaks && !isFocus,
          timeLeft: nextDuration,
          totalDuration: nextDuration,
          sessionStartTime: undefined,
          sessionsCompletedToday: newSessionsCompleted,
        };
      });
    },
    [state.settings, updateStudyLog, triggerConfetti]
  );

  // High-precision timer interval using timestamp difference
  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (!prev.isRunning) return prev;

        if (prev.timeLeft <= 1) {
          // Finished!
          clearInterval(interval);
          setTimeout(() => handleSessionComplete(prev), 0);
          return {
            ...prev,
            isRunning: false,
            timeLeft: 0,
          };
        }

        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, handleSessionComplete]);

  // Timer controls
  const startTimer = useCallback(() => {
    setTimer((prev) => ({
      ...prev,
      isRunning: true,
      sessionStartTime: Date.now(),
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.totalDuration,
      sessionStartTime: undefined,
    }));
  }, []);

  const setTimerMode = useCallback(
    (mode: 'focus' | 'short-break' | 'long-break' | 'custom', customMinutes?: number) => {
      let seconds = 25 * 60;
      if (mode === 'focus') {
        seconds = (state.settings.pomodoro?.focusDuration || 25) * 60;
      } else if (mode === 'short-break') {
        seconds = (state.settings.pomodoro?.shortBreakDuration || 5) * 60;
      } else if (mode === 'long-break') {
        seconds = (state.settings.pomodoro?.longBreakDuration || 15) * 60;
      } else if (mode === 'custom' && customMinutes) {
        seconds = customMinutes * 60;
      }

      setTimer((prev) => ({
        ...prev,
        mode,
        isRunning: false,
        timeLeft: seconds,
        totalDuration: seconds,
        sessionStartTime: undefined,
      }));
    },
    [state.settings.pomodoro]
  );

  const setActiveTimerTask = useCallback((taskId?: string, taskTitle?: string, category?: string) => {
    setTimer((prev) => ({
      ...prev,
      activeTaskId: taskId,
      activeTaskTitle: taskTitle,
      activeCategory: category || prev.activeCategory,
    }));
  }, []);

  const finishTimerSessionEarly = useCallback(() => {
    setTimer((prev) => {
      if (prev.timeLeft < prev.totalDuration) {
        // At least 1 second passed
        handleSessionComplete(prev);
      }
      return {
        ...prev,
        isRunning: false,
      };
    });
  }, [handleSessionComplete]);

  // Task Actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      completed: false,
      completedAt: null,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const toggleTaskComplete = useCallback(
    (id: string) => {
      setState((prev) => {
        const task = prev.tasks.find((t) => t.id === id);
        if (!task) return prev;

        const isNowCompleted = !task.completed;
        const nowIso = new Date().toISOString();
        const today = getLocalDateString();

        const updatedTask: Task = {
          ...task,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? nowIso : null,
          updatedAt: nowIso,
        };

        // Update daily study log tasks completed count
        const currentLog = prev.studyLogs[today] || {
          date: today,
          minutesStudied: 0,
          tasksCompleted: 0,
          sessionsCount: 0,
        };

        const delta = isNowCompleted ? 1 : -1;
        const updatedLog: DailyStudyLog = {
          ...currentLog,
          tasksCompleted: Math.max(0, currentLog.tasksCompleted + delta),
        };

        if (isNowCompleted) {
          triggerConfetti();
          if (prev.settings.soundEnabled) playChimeSound();
        }

        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? updatedTask : t)),
          studyLogs: {
            ...prev.studyLogs,
            [today]: updatedLog,
          },
        };
      });
    },
    [triggerConfetti]
  );

  const rescheduleTask = useCallback((id: string, newDueDate: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, dueDate: newDueDate, updatedAt: new Date().toISOString() } : t)),
    }));
  }, []);

  // Roadmap Actions
  const toggleTopic = useCallback((phaseId: number, topicId: string) => {
    setState((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          topics: p.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t)),
        };
      }),
    }));
  }, []);

  const toggleMilestone = useCallback(
    (phaseId: number, milestoneId: string) => {
      setState((prev) => {
        let isNowCompleted = false;
        const updatedPhases = prev.phases.map((p) => {
          if (p.id !== phaseId) return p;
          return {
            ...p,
            milestones: p.milestones.map((m) => {
              if (m.id === milestoneId) {
                isNowCompleted = !m.completed;
                return {
                  ...m,
                  completed: isNowCompleted,
                  completedAt: isNowCompleted ? new Date().toISOString() : undefined,
                };
              }
              return m;
            }),
          };
        });

        if (isNowCompleted) {
          triggerConfetti();
          if (prev.settings.soundEnabled) playChimeSound();
        }

        return {
          ...prev,
          phases: updatedPhases,
        };
      });
    },
    [triggerConfetti]
  );

  const toggleCourse = useCallback((phaseId: number, courseId: string) => {
    setState((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          courses: p.courses.map((c) => (c.id === courseId ? { ...c, completed: !c.completed } : c)),
        };
      }),
    }));
  }, []);

  const updateMilestoneDate = useCallback((phaseId: number, milestoneId: string, date: string) => {
    setState((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, targetDate: date } : m)),
        };
      }),
    }));
  }, []);

  // Project Actions
  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProj: Project = {
      ...projectData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  }, []);

  const updateProject = useCallback((project: Project) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === project.id ? { ...project, updatedAt: new Date().toISOString() } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const toggleProjectStep = useCallback(
    (projectId: string, stepId: string) => {
      setState((prev) => {
        let isCompletedNow = false;
        const updatedProjects = prev.projects.map((p) => {
          if (p.id !== projectId) return p;
          const updatedSteps = p.steps.map((s) => {
            if (s.id === stepId) {
              isCompletedNow = !s.completed;
              return {
                ...s,
                completed: isCompletedNow,
                completedAt: isCompletedNow ? new Date().toISOString() : undefined,
              };
            }
            return s;
          });

          const completedCount = updatedSteps.filter((s) => s.completed).length;
          const progressPercentage = Math.round((completedCount / Math.max(1, updatedSteps.length)) * 100);

          return {
            ...p,
            steps: updatedSteps,
            progressPercentage,
            status: progressPercentage === 100 ? ('Completed' as const) : progressPercentage > 0 ? ('In Progress' as const) : p.status,
            updatedAt: new Date().toISOString(),
          };
        });

        if (isCompletedNow) {
          triggerConfetti();
          if (prev.settings.soundEnabled) playChimeSound();
        }

        return {
          ...prev,
          projects: updatedProjects,
        };
      });
    },
    [triggerConfetti]
  );

  const addProjectBenchmark = useCallback((projectId: string, benchmark: Omit<BenchmarkRecord, 'id'>) => {
    const newRecord: BenchmarkRecord = {
      ...benchmark,
      id: 'bm-' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, benchmarks: [...p.benchmarks, newRecord], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const deleteProjectBenchmark = useCallback((projectId: string, benchmarkId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, benchmarks: p.benchmarks.filter((b) => b.id !== benchmarkId), updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  // Resource Actions
  const addResource = useCallback((resData: Omit<Resource, 'id' | 'createdAt'>) => {
    const newRes: Resource = {
      ...resData,
      id: 'res-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      resources: [newRes, ...prev.resources],
    }));
  }, []);

  const updateResource = useCallback((res: Resource) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === res.id ? res : r)),
    }));
  }, []);

  const deleteResource = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
    }));
  }, []);

  const setResourceStatus = useCallback((id: string, status: ResourceStatus) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  }, []);

  // Focus Session log
  const logFocusSession = useCallback(
    (sessionData: Omit<FocusSession, 'id'>) => {
      const newSession: FocusSession = {
        ...sessionData,
        id: 'sess-' + Date.now(),
      };
      setState((prev) => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
      }));
      updateStudyLog(sessionData.durationMinutes, 0);
    },
    [updateStudyLog]
  );

  // Internship Actions
  const addApplication = useCallback((appData: Omit<InternshipApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: InternshipApplication = {
      ...appData,
      id: 'app-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      applications: [newApp, ...prev.applications],
    }));
  }, []);

  const updateApplication = useCallback((app: InternshipApplication) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === app.id ? { ...app, updatedAt: new Date().toISOString() } : a)),
    }));
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.id !== id),
    }));
  }, []);

  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
      ),
    }));
  }, []);

  // Notification Actions
  const addNotification = useCallback((notifData: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: 'notif-' + Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  // Settings Actions
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  }, []);

  const exportData = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((jsonData: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON data structure.' };
      }
      if (!parsed.version || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.phases)) {
        return { success: false, error: 'File is missing required roadmap schema fields (version, tasks, phases).' };
      }
      setState(parsed as AppState);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file.' };
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(initialAppState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isDemoMode = !state.settings.supabaseConfig.useCloud || !state.settings.supabaseConfig.url;
  const cloudSyncAvailable = Boolean(state.settings.supabaseConfig.url && state.settings.supabaseConfig.anonKey);

  return (
    <AppContext.Provider
      value={{
        state,
        isDemoMode,
        cloudSyncAvailable,
        timer,
        startTimer,
        pauseTimer,
        resetTimer,
        setTimerMode,
        setActiveTimerTask,
        finishTimerSessionEarly,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        rescheduleTask,
        toggleTopic,
        toggleMilestone,
        toggleCourse,
        updateMilestoneDate,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectStep,
        addProjectBenchmark,
        deleteProjectBenchmark,
        addResource,
        updateResource,
        deleteResource,
        setResourceStatus,
        logFocusSession,
        addApplication,
        updateApplication,
        deleteApplication,
        updateApplicationStatus,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        updateSettings,
        exportData,
        importData,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
