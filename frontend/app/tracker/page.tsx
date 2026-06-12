"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";
import { ClipboardList, Loader2, Trash2, ChevronDown, ExternalLink, BarChart2, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Application {
  id: number; job_title: string; company: string; location?: string;
  job_url?: string; status: string; job_description?: string;
  tailored_resume?: string; cover_letter?: string; notes?: string; applied_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  Applied: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Interview: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  Offer: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  Rejected: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try { const res = await applicationsApi.list(); setApps(res.data); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: string) {
    await applicationsApi.update(id, { status });
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  async function deleteApp(id: number) {
    if (!confirm("Delete this application?")) return;
    await applicationsApi.delete(id);
    setApps(prev => prev.filter(a => a.id !== id));
  }

  const stats = STATUSES.map(s => ({ label: s, count: apps.filter(a => a.status === s).length }));

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-sub">Track every application from apply to offer</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, count }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: "var(--text)" }}>{count}</p>
              <span className={`badge border text-xs px-2 py-0.5 mt-1 ${STATUS_STYLE[label]}`}>{label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="ml-2 text-sm" style={{ color: "var(--muted)" }}>Loading…</span>
          </div>
        ) : apps.length === 0 ? (
          <div className="card p-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--border)" }} />
            <p className="font-medium" style={{ color: "var(--muted)" }}>No applications yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Use <Link href="/" className="text-indigo-500 hover:underline">Job Search</Link> or <Link href="/apply" className="text-indigo-500 hover:underline">One Click Apply</Link> to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map(app => (
              <div key={app.id} className="card overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{app.job_title}</h3>
                      <span style={{ color: "var(--border)" }}>·</span>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>{app.company}</span>
                      {app.location && <span className="text-xs" style={{ color: "var(--muted)" }}>{app.location}</span>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                      className={`badge border text-xs px-2 py-1 rounded cursor-pointer font-medium ${STATUS_STYLE[app.status]}`}
                      style={{ background: "transparent" }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {app.job_url && <a href={app.job_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-500 transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                    <Link href={`/ats?jd=${encodeURIComponent(app.job_description || "")}`} className="text-gray-400 hover:text-indigo-500 transition-colors" title="ATS Check"><BarChart2 className="w-4 h-4" /></Link>
                    <Link href={`/interview?title=${encodeURIComponent(app.job_title)}&company=${encodeURIComponent(app.company)}`} className="text-gray-400 hover:text-indigo-500 transition-colors" title="Interview Prep"><MessageSquare className="w-4 h-4" /></Link>
                    <button onClick={() => setExpanded(expanded === app.id ? null : app.id)} style={{ color: "var(--muted)" }} className="hover:text-indigo-500 transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded === app.id ? "rotate-180" : ""}`} />
                    </button>
                    <button onClick={() => deleteApp(app.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {expanded === app.id && (
                  <div className="border-t p-4 space-y-4" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                    {app.cover_letter && (
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--muted)" }}>Cover Letter</p>
                        <p className="text-sm whitespace-pre-wrap rounded-lg p-3 border max-h-40 overflow-y-auto" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}>{app.cover_letter}</p>
                      </div>
                    )}
                    {app.tailored_resume && (
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--muted)" }}>Tailored Resume</p>
                        <pre className="text-xs whitespace-pre-wrap font-mono rounded-lg p-3 border max-h-40 overflow-y-auto" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}>{app.tailored_resume}</pre>
                      </div>
                    )}
                    <NoteEditor appId={app.id} initial={app.notes || ""} onSave={(id, notes) => applicationsApi.update(id, { notes })} />
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

function NoteEditor({ appId, initial, onSave }: { appId: number; initial: string; onSave: (id: number, n: string) => void }) {
  const [notes, setNotes] = useState(initial);
  const [saved, setSaved] = useState(false);
  function save() { onSave(appId, notes); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  return (
    <div>
      <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--muted)" }}>Notes</p>
      <textarea className="textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this application…" />
      <button onClick={save} className="mt-1.5 btn-secondary text-xs px-3 py-1.5">{saved ? "✓ Saved" : "Save Notes"}</button>
    </div>
  );
}
