import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl || import.meta.env.VITE_SUPABASE_URL;
  const anonKey = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, anonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
}

export function isSupabaseConfigured(customUrl?: string, customKey?: string): boolean {
  const url = customUrl || import.meta.env.VITE_SUPABASE_URL;
  const anonKey = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && url.trim().length > 0 && anonKey.trim().length > 0);
}

/**
 * Complete PostgreSQL database schema with Row Level Security (RLS)
 * for when Supabase is configured.
 */
export const SUPABASE_SQL_SCHEMA = `-- Systems Engineer Command Center: PostgreSQL Schema with RLS
-- Run this in your Supabase SQL Editor to set up cloud sync

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Profiles & Settings
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  target_role text not null default 'High-Performance Systems & AI Infrastructure Engineer',
  hours_per_day numeric not null default 2,
  daily_study_goal_minutes integer not null default 120,
  current_semester integer not null default 3,
  timezone text not null default 'UTC',
  theme text not null default 'dark',
  reminder_time text not null default '20:00',
  reminders_enabled jsonb not null default '{"taskDeadlines": true, "milestones": true, "dailyStudy": true, "overdue": true}'::jsonb,
  pomodoro_settings jsonb not null default '{"focusDuration": 25, "shortBreakDuration": 5, "longBreakDuration": 15, "sessionsBeforeLongBreak": 4, "autoStartBreaks": false}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tasks Table
create table if not exists public.tasks (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  priority text not null default 'Medium',
  due_date date not null,
  estimated_minutes integer not null default 30,
  actual_minutes integer not null default 0,
  completed boolean not null default false,
  completed_at timestamp with time zone,
  phase_id integer,
  is_recurring boolean not null default false,
  recurring_frequency text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Roadmap Progress Table
create table if not exists public.roadmap_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  phase_id integer not null,
  item_type text not null, -- 'topic', 'milestone', 'course'
  item_id text not null,
  completed boolean not null default false,
  completed_at timestamp with time zone,
  notes text,
  target_date date,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, phase_id, item_type, item_id)
);

-- 4. Projects Table
create table if not exists public.projects (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  phase_id integer not null,
  semester text not null,
  description text,
  learning_objectives jsonb default '[]'::jsonb,
  status text not null default 'Not Started',
  start_date date,
  target_date date,
  progress_percentage integer not null default 0,
  steps jsonb default '[]'::jsonb,
  notes text,
  github_url text,
  doc_url text,
  benchmarks jsonb default '[]'::jsonb,
  next_action text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Focus Sessions Table
create table if not exists public.focus_sessions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  task_id text,
  task_title text,
  category text not null,
  start_time timestamp with time zone not null,
  duration_minutes integer not null,
  completed boolean not null default true,
  type text not null default 'focus',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Internship Applications Table
create table if not exists public.internship_applications (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  company text not null,
  role_title text not null,
  job_url text,
  location text,
  application_date date not null,
  deadline date,
  status text not null default 'Interested',
  next_follow_up_date date,
  notes text,
  required_skills jsonb default '[]'::jsonb,
  resume_version text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.user_profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.projects enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.internship_applications enable row level security;

-- Row Level Security Policies (per-user isolation)
create policy "Users can view and edit own profile" on public.user_profiles
  for all using (auth.uid() = id);

create policy "Users can view and edit own tasks" on public.tasks
  for all using (auth.uid() = user_id);

create policy "Users can view and edit own roadmap progress" on public.roadmap_progress
  for all using (auth.uid() = user_id);

create policy "Users can view and edit own projects" on public.projects
  for all using (auth.uid() = user_id);

create policy "Users can view and edit own focus sessions" on public.focus_sessions
  for all using (auth.uid() = user_id);

create policy "Users can view and edit own internship applications" on public.internship_applications
  for all using (auth.uid() = user_id);
`;
