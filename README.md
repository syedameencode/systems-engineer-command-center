# Systems Engineer Command Center ⚡
### High-Performance Systems & AI Infrastructure Blueprint Dashboard

> A personal study planner, engineering roadmap, and career preparation command center engineered for computer science students targeting high-frequency trading (HFT) infrastructure, quantitative finance, sovereign wealth funds (ADIA, PIF), national exchanges (Tadawul, NSE), and frontier AI labs (NVIDIA, Scale AI).

---

## 🎯 Target Profile & Blueprint

- **Focus**: C++20 low-latency systems, cache-friendly data structures, lock-free ring buffers, Linux epoll networking, write-ahead logs, and CUDA GPU inference kernels.
- **Commitment**: ~2 hours/day deliberate practice.
- **Roadmap Curriculum**: Complete 5-phase "Zero-to-Hero" blueprint matching Semesters 3 through 8.

---

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 with custom dark developer theme
- **Icons**: Lucide React
- **Charts**: Recharts (Study Progression, Engineering Category Split, Consistency)
- **Routing**: React Router v7
- **Date Utilities**: date-fns & native Intl APIs
- **Database & Auth (Optional)**: Supabase PostgreSQL with per-user Row Level Security (RLS)
- **Local-First Persistence**: LocalStorage with schema versioning (`systems_command_center_state_v1`)
- **Unit Testing**: Vitest test runner

---

## 🚀 Getting Started

### 1. Installation
Clone this repository and install dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Unit Tests
```bash
npm test
# or
npx vitest run
```

### 4. Build for Production
```bash
npm run build
```

---

## 💻 Features & Modules

1. **Personalized Dashboard (`/`)**
   - Time-of-day greeting ("Good morning, Engineer") and real-time objective tracking.
   - Dynamic summary cards: Today's completed tasks, study time completed today vs 120-minute target, current streak, and weighted blueprint completion.
   - Today's learning plan with immediate toggle and timer launch.
   - Weekly study consistency chart (hours/day).
   - Semester 3 active phase overview with next milestone target.
   - Flagship project status indicators and career target compass.

2. **My Roadmap (`/roadmap`)**
   - All 5 blueprint phases:
     - **Phase 1 (Semester 3)**: The Absolute Base — Raw memory, pointers, CPU hardware, reach 1400 on Codeforces.
     - **Phase 2 (Semester 4)**: OS Internals & Concurrency — Linux threading, CPU cache lines (`alignas(64)`), reach 1600 on Codeforces.
     - **Phase 3 (Semester 5)**: Networking, Databases & Linear Algebra — Low-latency sockets, epoll, WAL, limit order book matching engine.
     - **Phase 4 (Semester 6)**: AI Systems & GPU Architecture — CUDA kernels, SRAM tiled MatMul, KV-cache ring buffer, INT8 quantization.
     - **Phase 5 (Semesters 7 & 8)**: Open-Source Proof & Execution — PRs to `llama.cpp`/`vLLM`, *Effective Modern C++*, NeetCode 150 drills.
   - Industry Pro-Tips on every phase (e.g., `-std=c++20 -O3 -Wall -Wextra -Werror`, why avoid `std::endl`).
   - Interactive topic and milestone checklists, course portals (Nand to Tetris, OSTEP, CSES, Coursera UCSC).

3. **Daily Task Manager (`/tasks`)**
   - Full CRUD: Create, edit, reschedule, delete tasks.
   - Categories: `C++`, `DSA`, `Systems`, `AI`, `Projects`, `Career`, `College`.
   - Priorities (`High`, `Medium`, `Low`), due dates, estimated vs actual minutes.
   - Search, filter by status (Today, Overdue, Incomplete, Completed), and sort.
   - Confirmation dialogs for destructive actions.
   - Direct focus timer launcher from any task card.

4. **Study Timer & Focus Mode (`/study-timer`)**
   - Pomodoro & custom sessions: 25-minute focus, 5-minute short break, 15-minute long break, custom time.
   - High-precision timestamp-based countdown with animated circular SVG progress ring.
   - Task and category selector to credit study minutes directly to the task and daily total.
   - Synthesized Web Audio chime on session completion (works 100% offline).
   - Desktop browser notifications with explicit permission request.
   - Fullscreen Zen Mode for distraction-free deep work.

5. **Flagship Projects Workspace (`/projects`)**
   - 4 Pre-populated Flagship Projects:
     1. **Custom Memory Arena Allocator & STL Vector** (Move semantics, 64MB Arena, `new`/`delete` overloads, 10M int benchmark).
     2. **Lock-Free SPSC Ring Buffer & Async Logger** (`std::atomic` acquire/release, `alignas(64)` false sharing prevention, P99 latency benchmark across 50M messages).
     3. **Limit Order Book & Matching Engine (C++20)** (Doubly-linked list + hash map, zero heap allocations, Linux epoll TCP/UDP, WAL mmap, `__rdtsc()` latency measurement).
     4. **Zero-Python C++/CUDA LLM Inference Engine** (mmap weight loader, custom CUDA kernels with shared memory SRAM tiling, KV-cache ring buffer, INT8 quantization).
   - Milestone checklist for each project.
   - **Latency Percentile Benchmark Table**: Document throughput, P50, P99, P99.9 latency for `v1` vs `v2` implementations.
   - Modal for entering real benchmark measurements.

6. **Courses & Resources Library (`/resources`)**
   - Searchable, phase-mapped library seeded with LearnCpp, CSES Problem Set, Nand to Tetris, OSTEP, CUDA docs, Python tutorials, UCSC Coursera, QuantGuide.
   - Status tracking (`Not Started`, `In Progress`, `Completed`), personal notes, and safe external links.

7. **Analytics (`/analytics`)**
   - Calculated strictly from real app state: study logs, task durations, and focus sessions.
   - Study time progression area charts (7 days, 30 days, all time).
   - Time by engineering category donut chart.
   - Real streak tracking and curriculum phase progress breakdown.

8. **Internship & Career Tracker (`/internships`)**
   - Kanban board pipeline (`Interested`, `Preparing`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`) and table view.
   - Track application dates, deadlines, job URLs, required skills, and resume versions.
   - Target Firms Showcase (ADIA, Citadel Securities, Tadawul, NSE, NVIDIA, Scale AI, Jane Street) kept strictly separate from actual applications.

9. **Settings & Persistence (`/settings`)**
   - Daily study target adjustment (default 120 minutes).
   - Timezone configuration and reminder times.
   - Theme toggle (Dark / Light mode).
   - Full JSON Export and Schema-Validated JSON Import.
   - Reset to initial seed defaults with confirmation modal.
   - Supabase PostgreSQL cloud sync configuration and one-click copyable SQL schema script.

---

## ☁️ Optional Supabase Cloud Synchronization

The app operates 100% offline in Local-First Demo Mode by default. If you wish to connect Supabase:

1. Create a free project on [supabase.com](https://supabase.com).
2. Go to the SQL Editor and paste the schema provided in `/settings` (or `src/services/supabase.ts`).
3. Set your environment variables in `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   Or enter them directly in the **Settings** page within the app.

---

## 🧪 Testing

The codebase includes automated unit tests covering:
- Consecutive calendar streak calculations
- Gap-day streak resets
- Weighted roadmap progress (40% topics, 30% milestones, 30% projects)
- Today study statistics and daily goal progress
- Time formatting and ISO date calculations
- Task completion and undo
- Session de-duplication
- JSON import schema validation

Run all tests:
```bash
npx vitest run
```
