import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  Trash2,
  Edit2,
  X,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InternshipApplication, ApplicationStatus } from '../types';
import { suggestedCompanies } from '../data/initialData';
import { formatDisplayDate, getLocalDateString } from '../utils/calculations';
import { ConfirmationModal } from '../components/ConfirmationModal';

const STATUS_COLUMNS: ApplicationStatus[] = [
  'Interested',
  'Preparing',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Interested: 'bg-slate-800 text-slate-300 border-slate-700',
  Preparing: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Applied: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Assessment: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Interview: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Offer: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold',
  Rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Withdrawn: 'bg-slate-800 text-slate-400 border-slate-700',
};

export const InternshipTrackerPage: React.FC = () => {
  const {
    state,
    addApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');

  // Application Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<InternshipApplication | null>(null);
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('');
  const [applicationDate, setApplicationDate] = useState(getLocalDateString());
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Interested');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [resumeVersion, setResumeVersion] = useState('v1.0-systems');

  // Deletion state
  const [appToDelete, setAppToDelete] = useState<InternshipApplication | null>(null);

  const filteredApplications = state.applications.filter((app) => {
    if (searchQuery.trim() !== '') {
      const match =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAdd = (suggestedCompany?: string) => {
    setEditingApp(null);
    setCompany(suggestedCompany || '');
    setRoleTitle(suggestedCompany ? 'Low-Latency Systems Engineering Intern' : '');
    setJobUrl('');
    setLocation(suggestedCompany ? 'Abu Dhabi / Riyadh / Remote' : '');
    setApplicationDate(getLocalDateString());
    setDeadline('');
    setStatus('Interested');
    setNextFollowUpDate('');
    setNotes('');
    setSkillsStr('C++20, Concurrency, Linux Sockets');
    setResumeVersion('v1.0-systems');
    setShowModal(true);
  };

  const handleOpenEdit = (app: InternshipApplication) => {
    setEditingApp(app);
    setCompany(app.company);
    setRoleTitle(app.roleTitle);
    setJobUrl(app.jobUrl || '');
    setLocation(app.location);
    setApplicationDate(app.applicationDate);
    setDeadline(app.deadline || '');
    setStatus(app.status);
    setNextFollowUpDate(app.nextFollowUpDate || '');
    setNotes(app.notes || '');
    setSkillsStr(app.requiredSkills?.join(', ') || '');
    setResumeVersion(app.resumeVersion || 'v1.0-systems');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !roleTitle.trim()) return;

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingApp) {
      updateApplication({
        ...editingApp,
        company: company.trim(),
        roleTitle: roleTitle.trim(),
        jobUrl: jobUrl.trim(),
        location: location.trim(),
        applicationDate,
        deadline: deadline || undefined,
        status,
        nextFollowUpDate: nextFollowUpDate || undefined,
        notes: notes.trim(),
        requiredSkills: skills,
        resumeVersion: resumeVersion.trim(),
      });
    } else {
      addApplication({
        company: company.trim(),
        roleTitle: roleTitle.trim(),
        jobUrl: jobUrl.trim(),
        location: location.trim(),
        applicationDate,
        deadline: deadline || undefined,
        status,
        nextFollowUpDate: nextFollowUpDate || undefined,
        notes: notes.trim(),
        requiredSkills: skills,
        resumeVersion: resumeVersion.trim(),
      });
    }

    setShowModal(false);
  };

  // Metrics based strictly on actual applications
  const totalApps = state.applications.length;
  const activeInterviews = state.applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Assessment'
  ).length;
  const offersCount = state.applications.filter((a) => a.status === 'Offer').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            HIGH-PERFORMANCE CAREER PIPELINE
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Internship & Career Tracker</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Track applications, assessments, interview rounds, and follow-ups for Sovereign Wealth Funds, National Exchanges, and Frontier AI labs.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-950 transition-all cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Applications</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{totalApps}</div>
          <span className="text-[11px] text-slate-400 font-mono">Real submissions logged</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Active Interview Loops</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{activeInterviews}</div>
          <span className="text-[11px] text-slate-400 font-mono">Assessment / Technical</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Offers Received</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{offersCount}</div>
          <span className="text-[11px] text-slate-400 font-mono">Target firms</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Interview Conversion</span>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
            {totalApps > 0 ? `${Math.round((activeInterviews / totalApps) * 100)}%` : '0%'}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Based on logged apps</span>
        </div>
      </div>

      {/* View Toggle & Search */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, or location..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'board'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.slice(0, 4).map((colStatus) => {
            const colApps = filteredApplications.filter((a) => a.status === colStatus);
            return (
              <div
                key={colStatus}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    {colStatus}
                  </span>
                  <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colApps.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
                      No applications in this stage
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-100">{app.company}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(app)}
                              className="text-slate-500 hover:text-slate-300 p-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setAppToDelete(app)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-slate-300 font-medium">{app.roleTitle}</div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{app.location}</span>
                        </div>

                        {app.requiredSkills && app.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {app.requiredSkills.slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[9px] font-mono"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded px-1.5 py-1 focus:outline-none"
                          >
                            {STATUS_COLUMNS.map((st) => (
                              <option key={st} value={st}>
                                Move: {st}
                              </option>
                            ))}
                          </select>

                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                            >
                              <span>Posting</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          {filteredApplications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No applications logged yet. Click "+ Add Application" or pick from the suggested target firms below.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Role Title</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date Applied</th>
                  <th className="py-3 px-3">Resume</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-semibold text-slate-100">{app.company}</td>
                    <td className="py-3 px-3 text-slate-300">{app.roleTitle}</td>
                    <td className="py-3 px-3 text-slate-400">{app.location}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{formatDisplayDate(app.applicationDate)}</td>
                    <td className="py-3 px-3 text-slate-400">{app.resumeVersion}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAppToDelete(app)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Suggested Target Companies Section (Kept strictly separate from real applications!) */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Target Firms & Career Compass Directory</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Suggested companies for high-performance systems and AI infrastructure roles. Click any company to quick-create an application entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestedCompanies.map((c, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-cyan-400 font-semibold mb-1">
                  {c.tier}
                </div>
                <div className="text-xs font-bold text-slate-100">{c.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.focus}</div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {c.skills.map((sk, sidx) => (
                    <span
                      key={sidx}
                      className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[9px] font-mono"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenAdd(c.name)}
                className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Track Application</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-semibold text-slate-100">
                {editingApp ? 'Edit Application' : 'Add Application Entry'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Company</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. ADIA / Citadel / NVIDIA"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Role Title</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Systems Software Engineer Intern"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Abu Dhabi, UAE / Remote"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {STATUS_COLUMNS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Job Posting URL</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Date Applied</label>
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Deadline / Next Follow-up</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Skills Mentioned (comma-separated)</label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="e.g. C++20, Lock-Free, Linux epoll, CUDA"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes & Interview Feedback</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Referral contact, coding round questions, recruiter follow-up date..."
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
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
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Application Deletion */}
      <ConfirmationModal
        isOpen={Boolean(appToDelete)}
        title="Delete Application"
        message={`Are you sure you want to delete your application record for ${appToDelete?.company}?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (appToDelete) {
            deleteApplication(appToDelete.id);
            setAppToDelete(null);
          }
        }}
        onClose={() => setAppToDelete(null)}
      />
    </div>
  );
};
