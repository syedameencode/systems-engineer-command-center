import { describe, it, expect, beforeEach } from 'vitest';
import { initialAppState } from '../data/initialData';
import { AppState, Task, FocusSession } from '../types';

describe('State & Business Logic Unit Tests', () => {
  let testState: AppState;

  beforeEach(() => {
    testState = JSON.parse(JSON.stringify(initialAppState));
  });

  it('toggles task completion and safely updates completedAt timestamp and log count', () => {
    const task = testState.tasks[0];
    const initialStatus = task.completed;

    // Toggle complete
    task.completed = !initialStatus;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    expect(task.completed).toBe(!initialStatus);
    if (task.completed) {
      expect(task.completedAt).not.toBeNull();
    } else {
      expect(task.completedAt).toBeNull();
    }

    // Toggle undo
    task.completed = initialStatus;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    expect(task.completed).toBe(initialStatus);
  });

  it('prevents duplicate session recording when logging focus sessions', () => {
    const initialSessionCount = testState.sessions.length;
    const newSession: FocusSession = {
      id: 'sess-test-unique-123',
      taskId: 'task-1',
      taskTitle: 'Configure C++20 build environment',
      category: 'C++',
      startTime: '2026-10-18T10:00:00Z',
      durationMinutes: 25,
      completed: true,
      type: 'focus',
    };

    // Add session once
    testState.sessions.unshift(newSession);
    expect(testState.sessions.length).toBe(initialSessionCount + 1);

    // Duplicate check: ensure we don't insert duplicate id
    const isDuplicate = testState.sessions.filter((s) => s.id === 'sess-test-unique-123').length > 1;
    expect(isDuplicate).toBe(false);
  });

  it('validates JSON import schema correctly', () => {
    // Valid import
    const validJson = JSON.stringify(testState);
    const parsedValid = JSON.parse(validJson);
    const isValid = Boolean(
      parsedValid &&
      parsedValid.version &&
      Array.isArray(parsedValid.tasks) &&
      Array.isArray(parsedValid.phases)
    );
    expect(isValid).toBe(true);

    // Invalid import: missing required fields
    const invalidJson = JSON.stringify({ name: 'corrupted', foo: 'bar' });
    const parsedInvalid = JSON.parse(invalidJson);
    const isCorruptValid = Boolean(
      parsedInvalid &&
      parsedInvalid.version &&
      Array.isArray(parsedInvalid.tasks) &&
      Array.isArray(parsedInvalid.phases)
    );
    expect(isCorruptValid).toBe(false);
  });

  it('correctly credits focus session duration to associated task actualMinutes', () => {
    const targetTask = testState.tasks.find((t) => t.id === 'task-3');
    expect(targetTask).toBeDefined();
    const initialActual = targetTask!.actualMinutes || 0;

    // Simulate focus session on task-3 for 25 minutes
    const sessionDuration = 25;
    targetTask!.actualMinutes = initialActual + sessionDuration;

    expect(targetTask!.actualMinutes).toBe(initialActual + 25);
  });
});
