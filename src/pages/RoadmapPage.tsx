import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  CheckCircle2,
  Circle,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Award,
  BookOpen,
  FolderGit2,
  Lightbulb,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculatePhaseProgress,
  calculateOverallRoadmapProgress,
  formatDisplayDate,
} from '../utils/calculations';

export const RoadmapPage: React.FC = () => {
  const { state, toggleTopic, toggleMilestone, toggleCourse } = useApp();
  const navigate = useNavigate();

  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const [filterPhase, setFilterPhase] = useState<number | 'all'>('all');

  const overallProgress = calculateOverallRoadmapProgress(state.phases, state.projects);

  const togglePhaseExpand = (phaseId: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const expandAll = () => {
    setExpandedPhases({ 1: true, 2: true, 3: true, 4: true, 5: true });
  };

  const collapseAll = () => {
    setExpandedPhases({ 1: false, 2: false, 3: false, 4: false, 5: false });
  };

  const displayedPhases = state.phases.filter(
    (p) => filterPhase === 'all' || p.id === filterPhase
  );

  const courseraSearchUrl = (title: string) =>
    `https://www.coursera.org/search?query=${encodeURIComponent(title)}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
              <Map className="w-3.5 h-3.5 text-cyan-400" />
              THE ZERO-TO-HERO ENGINEERING BLUEPRINT
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              High-Performance Systems & AI Infrastructure Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              A zero-dependency curriculum engineered to transform a 3rd-semester student into an elite systems engineer, unlocking 100% Halal opportunities at global Sovereign Wealth Funds (ADIA, PIF), national exchanges (Tadawul, NSE), and Frontier AI labs (NVIDIA, Scale AI).
            </p>
          </div>

          {/* Overall progress pill */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 text-center sm:text-right min-w-[180px]">
            <div className="text-xs text-slate-400 font-mono">WEIGHTED BLUEPRINT COMPLETION</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">{overallProgress}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Expand/Collapse */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1 font-medium">Phase:</span>
          <button
            onClick={() => setFilterPhase('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              filterPhase === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            All 5 Phases
          </button>
          {state.phases.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPhase(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                filterPhase === p.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
              }`}
            >
              Phase {p.id} ({p.semester})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Phases Accordions */}
      <div className="space-y-6">
        {displayedPhases.map((phase) => {
          const isExpanded = expandedPhases[phase.id];
          const phaseProgress = calculatePhaseProgress(phase, state.projects);
          const linkedProject = state.projects.find((p) => p.phaseId === phase.id || p.id === phase.projectId);

          const topicsCompleted = phase.topics.filter((t) => t.completed).length;
          const milestonesCompleted = phase.milestones.filter((m) => m.completed).length;
          const coursesCompleted = phase.courses.filter((c) => c.completed).length;

          return (
            <div
              key={phase.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-md transition-all"
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhaseExpand(phase.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/50 transition-colors select-none"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <button className="mt-0.5 sm:mt-0 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                        {phase.semester}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Weight: {phase.weight}%</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{phase.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{phase.targetGoal}</p>
                  </div>
                </div>

                {/* Progress Mini Bar & Stats */}
                <div className="flex items-center gap-4 shrink-0 sm:self-center">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-mono font-bold text-slate-200">{phaseProgress}% Complete</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {topicsCompleted}/{phase.topics.length} topics · {milestonesCompleted}/{phase.milestones.length} milestones
                    </div>
                  </div>

                  <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Phase Body (Expanded) */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800/80 space-y-6 bg-slate-950/40">
                  {/* Pro-Tips Callout */}
                  {phase.proTips && phase.proTips.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-amber-400 font-mono text-[11px]">
                        <Lightbulb className="w-4 h-4" />
                        <span>INDUSTRY PRO-TIPS</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-300">
                        {phase.proTips.map((tip, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="font-mono text-amber-300">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Section Grid: Milestones & Project */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Milestones Card */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Key Milestones ({milestonesCompleted}/{phase.milestones.length})
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {phase.milestones.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
                              m.completed
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                                : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <button
                              onClick={() => toggleMilestone(phase.id, m.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                m.completed
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                                  : 'border-slate-700 hover:border-cyan-400 bg-slate-900'
                              }`}
                            >
                              {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <div className="flex-1">
                              <span
                                className={`text-xs font-medium ${
                                  m.completed ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {m.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                                  {m.category}
                                </span>
                                {m.targetDate && (
                                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDisplayDate(m.targetDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Linked Flagship Project */}
                    {linkedProject && (
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FolderGit2 className="w-4 h-4 text-indigo-400" />
                              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                Flagship Project
                              </h4>
                            </div>
                            <span className="text-xs font-mono font-semibold text-cyan-400">
                              {linkedProject.progressPercentage}%
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-slate-100">{linkedProject.title}</h5>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-3">{linkedProject.description}</p>

                          <div className="mt-3 space-y-1.5">
                            {linkedProject.steps.slice(0, 3).map((step) => (
                              <div
                                key={step.id}
                                className="text-[11px] text-slate-300 flex items-center gap-2 line-clamp-1"
                              >
                                {step.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                )}
                                <span className={step.completed ? 'line-through text-slate-400' : ''}>
                                  {step.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/projects')}
                          className="mt-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 text-xs font-medium transition-all cursor-pointer"
                        >
                          <span>Open Project Workspace & Benchmarks</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Topics List & Coursera Checklist Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Topics List */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Core Topics ({topicsCompleted}/{phase.topics.length})
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {phase.topics.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => toggleTopic(phase.id, t.id)}
                            className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                              t.completed
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                                : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                t.completed
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                  : 'border-slate-700 bg-slate-900'
                              }`}
                            >
                              {t.completed && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span
                              className={`text-xs ${
                                t.completed ? 'line-through text-slate-400' : 'text-slate-200'
                              }`}
                            >
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Course & Practice Checklist */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Courses & Curricula ({coursesCompleted}/{phase.courses.length})
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {phase.courses.map((c) => (
                          <div
                            key={c.id}
                            className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-all ${
                              c.completed
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                                : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={() => toggleCourse(phase.id, c.id)}
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  c.completed
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-slate-700 bg-slate-900'
                                }`}
                              >
                                {c.completed && <CheckCircle2 className="w-3 h-3" />}
                              </button>
                              <div>
                                <div
                                  className={`text-xs font-medium ${
                                    c.completed ? 'line-through text-slate-400' : 'text-slate-200'
                                  }`}
                                >
                                  {c.title}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{c.provider}</div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <a
                                href={courseraSearchUrl(c.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md border border-slate-700 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                                title={`Find ${c.title} on Coursera`}
                              >
                                Coursera
                              </a>
                              {c.url && (
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded p-1 text-slate-500 hover:text-cyan-400"
                                  title="Open course website safely"
                                  aria-label={`Open ${c.title} source website`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
