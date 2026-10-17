export type Priority = 'Low' | 'Medium' | 'High';

export type TaskCategory =
  | 'C++'
  | 'DSA'
  | 'Systems'
  | 'AI'
  | 'Projects'
  | 'Career'
  | 'College';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // ISO string YYYY-MM-DD
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  completedAt?: string | null;
  phaseId?: number | null;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  targetDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface RoadmapCourse {
  id: string;
  title: string;
  provider: string;
  url?: string;
  completed: boolean;
  notes?: string;
}

export interface RoadmapPhase {
  id: number;
  title: string;
  subtitle: string;
  semester: string;
  targetGoal: string;
  weight: number; // e.g., 20%
  topics: RoadmapTopic[];
  milestones: RoadmapMilestone[];
  courses: RoadmapCourse[];
  projectTitle: string;
  projectId: string;
  proTips?: string[];
  expanded?: boolean;
}

export interface BenchmarkRecord {
  id: string;
  version: string;
  throughput: string;
  p50: string;
  p99: string;
  p999: string;
  notes?: string;
}

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';

export interface ProjectStep {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  phaseId: number;
  semester: string;
  description: string;
  learningObjectives: string[];
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  progressPercentage: number;
  steps: ProjectStep[];
  notes: string;
  githubUrl: string;
  docUrl: string;
  benchmarks: BenchmarkRecord[];
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

export type ResourceStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: TaskCategory | 'General';
  phaseId: number;
  status: ResourceStatus;
  notes: string;
  recommended: boolean;
  createdAt: string;
}

export type FocusSessionType = 'focus' | 'short-break' | 'long-break';

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  category: TaskCategory | 'General';
  startTime: string; // ISO string
  durationMinutes: number;
  completed: boolean;
  type: FocusSessionType;
}

export type ApplicationStatus =
  | 'Interested'
  | 'Preparing'
  | 'Applied'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface InternshipApplication {
  id: string;
  company: string;
  roleTitle: string;
  jobUrl: string;
  location: string;
  applicationDate: string; // YYYY-MM-DD
  deadline?: string;
  status: ApplicationStatus;
  nextFollowUpDate?: string;
  notes: string;
  requiredSkills: string[];
  resumeVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'milestone' | 'daily' | 'system';
  read: boolean;
  timestamp: string; // ISO string
  link?: string;
}

export interface UserSettings {
  targetRole: string;
  hoursPerDay: number;
  dailyStudyGoalMinutes: number;
  currentSemester: number;
  timezone: string;
  theme: 'dark' | 'light';
  reminderTime: string; // e.g. "20:00"
  remindersEnabled: {
    taskDeadlines: boolean;
    milestones: boolean;
    dailyStudy: boolean;
    overdue: boolean;
  };
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
  pomodoro: {
    focusDuration: number; // minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
  };
  supabaseConfig: {
    url: string;
    anonKey: string;
    useCloud: boolean;
  };
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  tasksCompleted: number;
  sessionsCount: number;
}

export interface AppState {
  version: number;
  settings: UserSettings;
  tasks: Task[];
  phases: RoadmapPhase[];
  projects: Project[];
  resources: Resource[];
  sessions: FocusSession[];
  applications: InternshipApplication[];
  notifications: AppNotification[];
  studyLogs: Record<string, DailyStudyLog>;
}
