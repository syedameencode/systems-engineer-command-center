import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Cpu,
  BarChart2,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../types';
import { formatDisplayDate } from '../utils/calculations';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const ProjectsPage: React.FC = () => {
  const {
    state,
    toggleProjectStep,
    addProject,
    updateProject,
    deleteProject,
    addProjectBenchmark,
    deleteProjectBenchmark,
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(state.projects[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');

  // New Benchmark Modal State
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [bmVersion, setBmVersion] = useState('');
  const [bmThroughput, setBmThroughput] = useState('');
  const [bmP50, setBmP50] = useState('');
  const [bmP99, setBmP99] = useState('');
  const [bmP999, setBmP999] = useState('');
  const [bmNotes, setBmNotes] = useState('');

  // Delete Project Modal State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // New / Edit Project Modal State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projSemester, setProjSemester] = useState('Semester 3');
  const [projPhaseId, setProjPhaseId] = useState(1);
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('Not Started');
  const [projGithub, setProjGithub] = useState('');
  const [projDoc, setProjDoc] = useState('');
  const [projNextAction, setProjNextAction] = useState('');

  const selectedProject = state.projects.find((p) => p.id === selectedProjectId) || state.projects[0];

  const filteredProjects = state.projects.filter(
    (p) => statusFilter === 'All' || p.status === statusFilter
  );

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjTitle(proj.title);
    setProjSemester(proj.semester);
    setProjPhaseId(proj.phaseId);
    setProjDesc(proj.description);
    setProjStatus(proj.status);
    setProjGithub(proj.githubUrl || '');
    setProjDoc(proj.docUrl || '');
    setProjNextAction(proj.nextAction || '');
    setShowProjectModal(true);
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setProjTitle('');
    setProjSemester('Semester 3');
    setProjPhaseId(1);
    setProjDesc('');
    setProjStatus('Not Started');
    setProjGithub('');
    setProjDoc('');
    setProjNextAction('');
    setShowProjectModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    if (editingProject) {
      updateProject({
        ...editingProject,
        title: projTitle.trim(),
        semester: projSemester,
        phaseId: Number(projPhaseId),
        description: projDesc.trim(),
        status: projStatus,
        githubUrl: projGithub.trim(),
        docUrl: projDoc.trim(),
        nextAction: projNextAction.trim(),
      });
    } else {
      addProject({
        title: projTitle.trim(),
        phaseId: Number(projPhaseId),
        semester: projSemester,
        description: projDesc.trim(),
        learningObjectives: [
          'Verify low-latency architecture requirements',
          'Document memory layout and profiling results',
        ],
        status: projStatus,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date().toISOString().split('T')[0],
        progressPercentage: 0,
        steps: [
          { id: 's-' + Date.now() + '-1', title: 'Step 1: Baseline Architecture & Setup', completed: false },
          { id: 's-' + Date.now() + '-2', title: 'Step 2: Core Algorithm & Memory Model', completed: false },
          { id: 's-' + Date.now() + '-3', title: 'Step 3: Benchmarks & Latency Percentiles', completed: false },
        ],
        notes: '',
        githubUrl: projGithub.trim(),
        docUrl: projDoc.trim(),
        benchmarks: [],
        nextAction: projNextAction.trim(),
      });
    }

    setShowProjectModal(false);
  };

  const handleAddBenchmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !bmVersion.trim()) return;

    addProjectBenchmark(selectedProject.id, {
      version: bmVersion.trim(),
      throughput: bmThroughput.trim() || 'N/A',
      p50: bmP50.trim() || 'N/A',
      p99: bmP99.trim() || 'N/A',
      p999: bmP999.trim() || 'N/A',
      notes: bmNotes.trim(),
    });

    setBmVersion('');
    setBmThroughput('');
    setBmP50('');
    setBmP99('');
    setBmP999('');
    setBmNotes('');
    setShowBenchmarkModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            RESUME FILTER BYPASS PORTFOLIO
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Flagship Systems Projects</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            A Senior Engineer spends 15 seconds reviewing your GitHub. Every project must have an Excalidraw architecture diagram, CMake build instructions, and a Latency Percentile Table proving micro-architectural superiority.
          </p>
        </div>

        <button
          onClick={handleOpenNewProject}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-950 transition-all cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'In Progress', 'Not Started', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filteredProjects.length} Flagship Projects Active
        </div>
      </div>

      {/* Project Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProjects.map((proj) => {
          const isSelected = selectedProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <span className="text-cyan-400 font-semibold">{proj.semester}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded border ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : proj.status === 'In Progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span>Milestone Progress</span>
                  <span className="text-cyan-400 font-bold">{proj.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Full Detailed Workspace */}
      {selectedProject && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
          {/* Project Detailed Header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                  Phase {selectedProject.phaseId} · {selectedProject.semester}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Status: {selectedProject.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">{selectedProject.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            {/* Top Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              <button
                onClick={() => handleOpenEditProject(selectedProject)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                title="Edit Project Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setProjectToDelete(selectedProject)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Learning Objectives Callout */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Core Learning Objectives</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedProject.learningObjectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono font-bold">›</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Step-by-Step Checklist */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Implementation Milestone Checklist ({selectedProject.steps.filter((s) => s.completed).length}/
                  {selectedProject.steps.length})
                </span>
              </h4>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {selectedProject.progressPercentage}%
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedProject.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => toggleProjectStep(selectedProject.id, step.id)}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                    step.completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      step.completed
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {step.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-xs font-medium ${
                        step.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.completedAt && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        Completed on {formatDisplayDate(step.completedAt.split('T')[0])}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latency Percentile Benchmark Table (Resume Filter Bypass) */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <BarChart2 className="w-4 h-4 text-amber-400" />
                  <span>Latency Percentile Benchmark Results</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real benchmark measurements (P50, P99, P99.9 latency and ops/sec) documented for recruiters and technical interviewers.
                </p>
              </div>

              <button
                onClick={() => setShowBenchmarkModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Benchmark Result</span>
              </button>
            </div>

            {selectedProject.benchmarks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No benchmark measurements recorded yet. Enter your actual experimental measurements using Google Benchmark, chrono, or rdtsc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                      <th className="py-2.5 px-3">Implementation Version</th>
                      <th className="py-2.5 px-3">Throughput</th>
                      <th className="py-2.5 px-3">P50 Latency</th>
                      <th className="py-2.5 px-3">P99 Latency</th>
                      <th className="py-2.5 px-3">P99.9 Latency</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedProject.benchmarks.map((bm) => (
                      <tr key={bm.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{bm.version}</td>
                        <td className="py-2.5 px-3 text-emerald-400">{bm.throughput}</td>
                        <td className="py-2.5 px-3 text-slate-300">{bm.p50}</td>
                        <td className="py-2.5 px-3 text-amber-300">{bm.p99}</td>
                        <td className="py-2.5 px-3 text-rose-300">{bm.p999}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{bm.notes || '—'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteProjectBenchmark(selectedProject.id, bm.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Delete benchmark entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Next Action Callout */}
          {selectedProject.nextAction && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-cyan-300 font-semibold uppercase">NEXT ACTION:</span>
                <span className="text-slate-200">{selectedProject.nextAction}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Benchmark Modal */}
      {showBenchmarkModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-semibold text-slate-100">Add Real Benchmark Result</h4>
              <button onClick={() => setShowBenchmarkModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBenchmark} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Implementation Version</label>
                <input
                  type="text"
                  required
                  value={bmVersion}
                  onChange={(e) => setBmVersion(e.target.value)}
                  placeholder="e.g. v2: Lock-Free + Arena Pool"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Throughput</label>
                  <input
                    type="text"
                    value={bmThroughput}
                    onChange={(e) => setBmThroughput(e.target.value)}
                    placeholder="e.g. 4,850,000 ops/sec"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">P50 Latency</label>
                  <input
                    type="text"
                    value={bmP50}
                    onChange={(e) => setBmP50(e.target.value)}
                    placeholder="e.g. 0.18 µs"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">P99 Latency</label>
                  <input
                    type="text"
                    value={bmP99}
                    onChange={(e) => setBmP99(e.target.value)}
                    placeholder="e.g. 0.45 µs"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">P99.9 Latency</label>
                  <input
                    type="text"
                    value={bmP999}
                    onChange={(e) => setBmP999(e.target.value)}
                    placeholder="e.g. 1.90 µs"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Measurement Notes</label>
                <input
                  type="text"
                  value={bmNotes}
                  onChange={(e) => setBmNotes(e.target.value)}
                  placeholder="e.g. Measured via __rdtsc() on Linux kernel 6.5"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBenchmarkModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-semibold text-slate-100">
                {editingProject ? 'Edit Project' : 'Create Custom Systems Project'}
              </h4>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Project Title</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Kernel Bypass UDP Socket Parser"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Semester / Phase</label>
                  <select
                    value={projPhaseId}
                    onChange={(e) => setProjPhaseId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>Phase 1 (Semester 3)</option>
                    <option value={2}>Phase 2 (Semester 4)</option>
                    <option value={3}>Phase 3 (Semester 5)</option>
                    <option value={4}>Phase 4 (Semester 6)</option>
                    <option value={5}>Phase 5 (Semesters 7 & 8)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Architecture overview, micro-optimizations, zero-copy goals..."
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">GitHub URL</label>
                  <input
                    type="url"
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Documentation URL</label>
                  <input
                    type="url"
                    value={projDoc}
                    onChange={(e) => setProjDoc(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Next Immediate Action</label>
                <input
                  type="text"
                  value={projNextAction}
                  onChange={(e) => setProjNextAction(e.target.value)}
                  placeholder="e.g. Write CMake test target for zero-heap validation"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Project Deletion */}
      <ConfirmationModal
        isOpen={Boolean(projectToDelete)}
        title="Delete Flagship Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? All milestones and recorded benchmark records will be removed.`}
        confirmLabel="Delete Project"
        isDestructive={true}
        onConfirm={() => {
          if (projectToDelete) {
            deleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
};
