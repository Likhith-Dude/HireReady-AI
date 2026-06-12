"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";
import { ClipboardList, Loader2, Trash2, ChevronDown, Plus, ExternalLink } from "lucide-react";

interface Application {
  id: number;
  job_title: string;
  company: string;
  location?: string;
  job_url?: string;
  status: string;
  job_description?: string;
  tailored_resume?: string;
  cover_letter?: string;
  notes?: string;
  applied_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  Applied: "bg-blue-50 text-blue-700 border-blue-200",
  Interview: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Offer: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await applicationsApi.list();
      setApps(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: string) {
    await applicationsApi.update(id, { status });
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  async function deleteApp(id: number) {
    if (!confirm("Delete this application?")) return;
    await applicationsApi.delete(id);
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  async function saveNotes(id: number, notes: string) {
    await applicationsApi.update(id, { notes });
  }

  const stats = STATUSES.map((s) => ({ label: s, count: apps.filter((a) => a.status === s).length }));

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500 mt-1">Track and manage all your job applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, count }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{count}</p>
              <p className={`text-sm font-medium mt-1 badge border ${STATUS_STYLES[label]} px-2 py-0.5`}>{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="ml-2 text-gray-500">Loading applications...</span>
          </div>
        ) : apps.length === 0 ? (
          <div className="card p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No applications yet</p>
            <p className="text-sm text-gray-400 mt-1">Search for jobs and click Track, or use One Click Apply to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="card overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{app.job_title}</h3>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600 text-sm">{app.company}</span>
                      {app.location && <span className="text-gray-400 text-xs">{app.location}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`badge border text-xs px-2 py-1 rounded cursor-pointer font-medium ${STATUS_STYLES[app.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {app.job_url && (
                      <a href={app.job_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => setExpanded(expanded === app.id ? null : app.id)} className="text-gray-400 hover:text-gray-600">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded === app.id ? "rotate-180" : ""}`} />
                    </button>
                    <button onClick={() => deleteApp(app.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expanded === app.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                    {app.cover_letter && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cover Letter</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded p-3 border border-gray-200 max-h-40 overflow-y-auto">{app.cover_letter}</p>
                      </div>
                    )}
                    {app.tailored_resume && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tailored Resume</p>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded p-3 border border-gray-200 max-h-40 overflow-y-auto font-mono">{app.tailored_resume}</pre>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                      <NoteEditor appId={app.id} initial={app.notes || ""} onSave={saveNotes} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function NoteEditor({ appId, initial, onSave }: { appId: number; initial: string; onSave: (id: number, notes: string) => void }) {
  const [notes, setNotes] = useState(initial);
  const [saved, setSaved] = useState(false);
  function save() {
    onSave(appId, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div>
      <textarea className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this application..." />
      <button onClick={save} className="mt-2 btn-secondary text-xs px-3 py-1.5">
        {saved ? "✓ Saved" : "Save Notes"}
      </button>
    </div>
  );
}
