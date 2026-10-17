import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Resource, ResourceStatus, TaskCategory } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';


export const ResourcesPage: React.FC = () => {
  const { state, addResource, updateResource, deleteResource, setResourceStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | 'all'>('all');

  // Resource Modal state (Add / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<TaskCategory | 'General'>('C++');
  const [phaseId, setPhaseId] = useState(1);
  const [status, setStatus] = useState<ResourceStatus>('Not Started');
  const [notes, setNotes] = useState('');
  const [recommended, setRecommended] = useState(false);

  // Delete modal state
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  const courseraSearchUrl = (title: string) =>
    `https://www.coursera.org/search?query=${encodeURIComponent(title)}`;

  const filteredResources = state.resources.filter((res) => {
    if (searchQuery.trim() !== '') {
      const match =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.notes.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    if (selectedPhase !== 'all' && res.phaseId !== selectedPhase) {
      return false;
    }

    if (selectedStatus !== 'all' && res.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingResource(null);
    setTitle('');
    setUrl('');
    setCategory('C++');
    setPhaseId(1);
    setStatus('Not Started');
    setNotes('');
    setRecommended(false);
    setShowModal(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setTitle(res.title);
    setUrl(res.url);
    setCategory(res.category);
    setPhaseId(res.phaseId);
    setStatus(res.status);
    setNotes(res.notes);
    setRecommended(res.recommended);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    if (editingResource) {
      updateResource({
        ...editingResource,
        title: title.trim(),
        url: url.trim(),
        category,
        phaseId: Number(phaseId),
        status,
        notes: notes.trim(),
        recommended,
      });
    } else {
      addResource({
        title: title.trim(),
        url: url.trim(),
        category,
        phaseId: Number(phaseId),
        status,
        notes: notes.trim(),
        recommended,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            ENGINEERING CURRICULUM & DOCUMENTATION LIBRARY
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Courses & Technical Resources</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            High-signal textbooks, official documentation, problem sets, and course portals mapped directly to your 5-phase systems roadmap.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-950 transition-all cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, textbooks, or documentation..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Phase Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Phase:</span>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Phases</option>
            <option value={1}>Phase 1 (Semester 3)</option>
            <option value={2}>Phase 2 (Semester 4)</option>
            <option value={3}>Phase 3 (Semester 5)</option>
            <option value={4}>Phase 4 (Semester 6)</option>
            <option value={5}>Phase 5 (Semesters 7 & 8)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="text-cyan-400 font-semibold">Phase {res.phaseId}</span>
                <div className="flex items-center gap-1.5">
                  {res.recommended && (
                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                      <Star className="w-3 h-3 fill-amber-300" />
                      Must Read
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.2 rounded border ${
                      res.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : res.status === 'In Progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                {res.title}
              </h3>

              <div className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {res.notes || 'Curated reference resource.'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              {/* Status Toggle Quick Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setResourceStatus(
                      res.id,
                      res.status === 'Completed' ? 'In Progress' : 'Completed'
                    )
                  }
                  className={`p-1 rounded text-xs transition-colors ${
                    res.status === 'Completed'
                      ? 'text-emerald-400 hover:text-slate-400'
                      : 'text-slate-500 hover:text-emerald-400'
                  }`}
                  title={res.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(res)}
                  className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setResourceToDelete(res)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Safe Open Link Button */}
              <div className="flex items-center gap-2">
                <a
                  href={courseraSearchUrl(res.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/15"
                  aria-label={`Find ${res.title} on Coursera`}
                >
                  Coursera
                </a>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-700"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-semibold text-slate-100">
                {editingResource ? 'Edit Resource' : 'Add Course / Documentation Resource'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Resource Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LearnCpp.com — Modern C++ Tutorial"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">External URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Roadmap Phase</label>
                  <select
                    value={phaseId}
                    onChange={(e) => setPhaseId(Number(e.target.value))}
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
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Personal Notes / Summary</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Important chapters, key insights, practice problem lists..."
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Mark as Recommended / Must Read</span>
                <input
                  type="checkbox"
                  checked={recommended}
                  onChange={(e) => setRecommended(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(resourceToDelete)}
        title="Delete Resource"
        message={`Are you sure you want to delete "${resourceToDelete?.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (resourceToDelete) {
            deleteResource(resourceToDelete.id);
            setResourceToDelete(null);
          }
        }}
        onClose={() => setResourceToDelete(null)}
      />
    </div>
  );
};
