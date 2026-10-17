import { Task, RoadmapPhase, Project, FocusSession, DailyStudyLog } from '../types';

/**
 * Calculates current streak and longest streak in days from studyLogs.
 * Uses local calendar dates to prevent timezone drift.
 */
export function calculateStreak(
  studyLogs: Record<string, DailyStudyLog>,
  todayStr: string = getLocalDateString()
): { currentStreak: number; longestStreak: number; activeDaysCount: number } {
  const dates = Object.keys(studyLogs)
    .filter((d) => (studyLogs[d]?.minutesStudied || 0) > 0 || (studyLogs[d]?.tasksCompleted || 0) > 0)
    .sort();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysCount: 0 };
  }

  const activeDaysCount = dates.length;
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const currentDate = new Date(dateStr + 'T00:00:00');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  // Calculate current streak relative to today
  let currentStreak = 0;
  const today = new Date(todayStr + 'T00:00:00');
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // Check if today is active
  const isTodayActive = (studyLogs[todayStr]?.minutesStudied || 0) > 0 || (studyLogs[todayStr]?.tasksCompleted || 0) > 0;
  const isYesterdayActive = (studyLogs[yesterdayStr]?.minutesStudied || 0) > 0 || (studyLogs[yesterdayStr]?.tasksCompleted || 0) > 0;

  if (isTodayActive) {
    currentStreak = 1;
    let checkDate = new Date(yesterday);
    while (true) {
      const dStr = getLocalDateString(checkDate);
      if ((studyLogs[dStr]?.minutesStudied || 0) > 0 || (studyLogs[dStr]?.tasksCompleted || 0) > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (isYesterdayActive) {
    currentStreak = 1;
    let checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const dStr = getLocalDateString(checkDate);
      if ((studyLogs[dStr]?.minutesStudied || 0) > 0 || (studyLogs[dStr]?.tasksCompleted || 0) > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak, activeDaysCount };
}

/**
 * Calculates phase progress and overall weighted roadmap completion.
 * Formula per Phase:
 * - Topics: 40% of phase weight
 * - Milestones: 30% of phase weight
 * - Project Steps: 30% of phase weight
 */
export function calculatePhaseProgress(phase: RoadmapPhase, projects: Project[]): number {
  const project = projects.find((p) => p.phaseId === phase.id || p.id === phase.projectId);

  // Topic component (40%)
  const totalTopics = phase.topics.length;
  const completedTopics = phase.topics.filter((t) => t.completed).length;
  const topicScore = totalTopics > 0 ? (completedTopics / totalTopics) * 40 : 0;

  // Milestone component (30%)
  const totalMilestones = phase.milestones.length;
  const completedMilestones = phase.milestones.filter((m) => m.completed).length;
  const milestoneScore = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 30 : 0;

  // Project component (30%)
  let projectScore = 0;
  if (project && project.steps.length > 0) {
    const completedSteps = project.steps.filter((s) => s.completed).length;
    projectScore = (completedSteps / project.steps.length) * 30;
  }

  return Math.min(100, Math.round(topicScore + milestoneScore + projectScore));
}

export function calculateOverallRoadmapProgress(phases: RoadmapPhase[], projects: Project[]): number {
  if (phases.length === 0) return 0;
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const phase of phases) {
    const weight = phase.weight || 20;
    const phaseProg = calculatePhaseProgress(phase, projects);
    totalWeightedScore += (phaseProg * weight) / 100;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalWeightedScore / totalWeight) * 100);
}

/**
 * Calculates today's key stats: completed tasks, total study minutes, tasks remaining.
 */
export function calculateTodayStats(
  tasks: Task[],
  sessions: FocusSession[],
  studyGoalMinutes: number = 120,
  todayStr: string = getLocalDateString()
) {
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedTasksToday = tasks.filter(
    (t) => t.completed && (t.completedAt?.startsWith(todayStr) || t.dueDate === todayStr)
  );

  const pendingTasksToday = todayTasks.filter((t) => !t.completed);

  // Study minutes completed today (from sessions logged today)
  const todaySessions = sessions.filter(
    (s) => s.completed && s.startTime.startsWith(todayStr) && s.type === 'focus'
  );
  const sessionMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Also include task actual minutes if tasks were worked on today but not in a timer session
  const taskMinutes = completedTasksToday.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
  const totalMinutesStudied = Math.max(sessionMinutes, taskMinutes);

  const goalProgress = Math.min(100, Math.round((totalMinutesStudied / Math.max(1, studyGoalMinutes)) * 100));

  return {
    completedCount: completedTasksToday.length,
    totalTodayCount: todayTasks.length,
    pendingCount: pendingTasksToday.length,
    minutesStudied: totalMinutesStudied,
    goalMinutes: studyGoalMinutes,
    goalProgress,
  };
}

/**
 * Returns formatted local YYYY-MM-DD date string.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats minutes into "1h 30m" or "45m"
 */
export function formatMinutes(mins: number): string {
  if (mins <= 0) return '0m';
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hours === 0) return `${remaining}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

/**
 * Plays a pleasant Web Audio synthesizer notification chime.
 * Guaranteed to work offline with zero external audio assets.
 */
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.18, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch {
    // AudioContext blocked or not supported; ignore gracefully
  }
}

/**
 * Dispatches a native browser notification if permissions are granted.
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.svg',
      ...options,
    });
    return true;
  }
  return false;
}

/**
 * Formats dates for human display
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'No date';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
