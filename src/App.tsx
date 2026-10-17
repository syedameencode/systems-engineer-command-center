import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { CommandPalette } from './components/CommandPalette';
import { QuickAddTaskModal } from './components/QuickAddTaskModal';

import { DashboardPage } from './pages/DashboardPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { TaskManagerPage } from './pages/TaskManagerPage';
import { StudyTimerPage } from './pages/StudyTimerPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InternshipTrackerPage } from './pages/InternshipTrackerPage';
import { SettingsPage } from './pages/SettingsPage';
import { Task } from './types';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    const main = document.querySelector<HTMLElement>('.app-main');
    if (!main || !('IntersectionObserver' in window)) return;

    let observer: IntersectionObserver | undefined;
    const frame = window.requestAnimationFrame(() => {
      const cards = main.querySelectorAll<HTMLElement>(
        'div[class*="rounded-xl"], div[class*="rounded-2xl"], section[class*="rounded-xl"], article[class*="rounded-xl"]'
      );
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer?.unobserve(entry.target);
          });
        },
        { root: main, threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
      );

      cards.forEach((card, index) => {
        card.classList.add('scroll-reveal');
        card.style.setProperty('--reveal-delay', `${(index % 5) * 45}ms`);
        observer?.observe(card);
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [location.pathname]);

  const handleOpenQuickAdd = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsQuickAddOpen(true);
  };

  return (
    <div className="app-shell flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Persistent Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          onOpenQuickAdd={() => handleOpenQuickAdd()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenQuickAdd={() => handleOpenQuickAdd()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Persistent Top Header */}
        <Header
          onOpenQuickAdd={() => handleOpenQuickAdd()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Page Content Viewport */}
        <main key={location.pathname} className="app-main flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage onOpenQuickAdd={() => handleOpenQuickAdd()} />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/tasks" element={<TaskManagerPage onOpenQuickAdd={handleOpenQuickAdd} />} />
            <Route path="/study-timer" element={<StudyTimerPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/internships" element={<InternshipTrackerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Add Task Modal */}
      <QuickAddTaskModal
        isOpen={isQuickAddOpen}
        onClose={() => {
          setIsQuickAddOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Global Command Search Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickAdd={() => handleOpenQuickAdd()}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
