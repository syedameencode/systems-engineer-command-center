import { describe, it, expect } from 'vitest';
import {
  calculateStreak,
  calculatePhaseProgress,
  calculateOverallRoadmapProgress,
  calculateTodayStats,
  formatMinutes,
  getLocalDateString,
} from './calculations';
import { initialPhases, initialProjects } from '../data/initialData';
import { Task, FocusSession, DailyStudyLog, RoadmapPhase, Project } from '../types';

describe('Streak Calculations', () => {
  it('should return 0 streak for empty logs', () => {
    const res = calculateStreak({}, '2026-10-18');
    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(0);
    expect(res.activeDaysCount).toBe(0);
  });

  it('should calculate current streak when active today', () => {
    const logs: Record<string, DailyStudyLog> = {
      '2026-10-16': { date: '2026-10-16', minutesStudied: 60, tasksCompleted: 2, sessionsCount: 2 },
      '2026-10-17': { date: '2026-10-17', minutesStudied: 120, tasksCompleted: 3, sessionsCount: 4 },
      '2026-10-18': { date: '2026-10-18', minutesStudied: 45, tasksCompleted: 1, sessionsCount: 1 },
    };

    const res = calculateStreak(logs, '2026-10-18');
    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
    expect(res.activeDaysCount).toBe(3);
  });

  it('should preserve streak if studied yesterday but not yet today', () => {
    const logs: Record<string, DailyStudyLog> = {
      '2026-10-16': { date: '2026-10-16', minutesStudied: 60, tasksCompleted: 1, sessionsCount: 2 },
      '2026-10-17': { date: '2026-10-17', minutesStudied: 120, tasksCompleted: 2, sessionsCount: 3 },
    };

    const res = calculateStreak(logs, '2026-10-18');
    expect(res.currentStreak).toBe(2);
  });

  it('should reset current streak after a gap day', () => {
    const logs: Record<string, DailyStudyLog> = {
      '2026-10-14': { date: '2026-10-14', minutesStudied: 60, tasksCompleted: 1, sessionsCount: 1 },
      '2026-10-15': { date: '2026-10-15', minutesStudied: 60, tasksCompleted: 1, sessionsCount: 1 },
      // gap on 16 and 17
      '2026-10-18': { date: '2026-10-18', minutesStudied: 30, tasksCompleted: 1, sessionsCount: 1 },
    };

    const res = calculateStreak(logs, '2026-10-18');
    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(2);
  });
});

describe('Roadmap Progress Calculations', () => {
  it('should correctly weight topics (40%), milestones (30%), and projects (30%)', () => {
    const mockPhase: RoadmapPhase = {
      id: 1,
      title: 'Phase 1',
      subtitle: 'Test',
      semester: 'Sem 3',
      targetGoal: 'Goal',
      weight: 20,
      topics: [
        { id: 't1', title: 'T1', completed: true },
        { id: 't2', title: 'T2', completed: false },
      ], // 1/2 = 50% * 40% = 20%
      milestones: [
        { id: 'm1', title: 'M1', category: 'Algo', completed: true },
        { id: 'm2', title: 'M2', category: 'Algo', completed: true },
      ], // 2/2 = 100% * 30% = 30%
      courses: [],
      projectTitle: 'P1',
      projectId: 'proj-1',
    };

    const mockProjects: Project[] = [
      {
        id: 'proj-1',
        title: 'P1',
        phaseId: 1,
        semester: 'Sem 3',
        description: '',
        learningObjectives: [],
        status: 'In Progress',
        startDate: '',
        targetDate: '',
        progressPercentage: 50,
        steps: [
          { id: 's1', title: 'S1', completed: true },
          { id: 's2', title: 'S2', completed: false },
        ], // 1/2 = 50% * 30% = 15%
        notes: '',
        githubUrl: '',
        docUrl: '',
        benchmarks: [],
        nextAction: '',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const score = calculatePhaseProgress(mockPhase, mockProjects);
    // 20 + 30 + 15 = 65%
    expect(score).toBe(65);
  });

  it('should calculate overall weighted roadmap progress across all 5 phases', () => {
    const overall = calculateOverallRoadmapProgress(initialPhases, initialProjects);
    expect(overall).toBeGreaterThanOrEqual(0);
    expect(overall).toBeLessThanOrEqual(100);
  });
});

describe('Today Stats & Goal Calculations', () => {
  it('should accurately calculate completed tasks and study minutes', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        category: 'C++',
        priority: 'High',
        dueDate: '2026-10-18',
        estimatedMinutes: 30,
        actualMinutes: 30,
        completed: true,
        completedAt: '2026-10-18T10:00:00Z',
        isRecurring: false,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        title: 'Task 2',
        category: 'DSA',
        priority: 'Medium',
        dueDate: '2026-10-18',
        estimatedMinutes: 45,
        actualMinutes: 0,
        completed: false,
        isRecurring: false,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const sessions: FocusSession[] = [
      {
        id: 's1',
        category: 'C++',
        startTime: '2026-10-18T09:30:00Z',
        durationMinutes: 30,
        completed: true,
        type: 'focus',
      },
    ];

    const stats = calculateTodayStats(tasks, sessions, 120, '2026-10-18');
    expect(stats.completedCount).toBe(1);
    expect(stats.totalTodayCount).toBe(2);
    expect(stats.pendingCount).toBe(1);
    expect(stats.minutesStudied).toBe(30);
    expect(stats.goalProgress).toBe(25); // 30/120 = 25%
  });
});

describe('Formatting Utilities', () => {
  it('formats minutes into human readable text', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(125)).toBe('2h 5m');
  });

  it('returns valid local date string', () => {
    const dStr = getLocalDateString(new Date('2026-10-18T12:00:00'));
    expect(dStr).toBe('2026-10-18');
  });
});
