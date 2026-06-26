"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { jobsApi, applicationsApi, aiApi, DEFAULT_RESUME } from "@/lib/api";
import { Search, MapPin, Building2, ExternalLink, Plus, Loader2, DollarSign, Filter, Zap, AlertCircle } from "lucide-react";

interface Job {
  id: string; title: string; company: string; location: string;
  url: string; description: string; posted: string; tags: string[];
  source: string; salary?: string; job_type?: string;
  match_score?: number; match_label?: string;
}

const JOB_TYPES = ["", "Full-time", "Remote", "Contract", "Part-time"];

export default function JobSearchPage() {
  const [title, setTitle] = useState("MLOps Engineer");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slowNotice, setSlowNotice] = useState(false);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => { search(); }, []);

  async function search() {
    setLoading(true);
    setError(null);
    setSlowNotice(false);
    const slowTimer = setTimeout(() => setSlowNotice(true), 6000);
    try {
      const res = await jobsApi.search(title, location, 20, jobType);
      setJobs(res.data.jobs || []);
    } catch (e: any) {
      setError(
        e?.code === "ECONNABORTED"
          ? "The server is waking up (free tier sleeps when idle). Please try again in a few seconds."
          : e?.response?.data?.detail || e?.message || "Could not load jobs. Please try again."
      );
    } finally {
      clearTimeout(slowTimer);
      setSlowNotice(false);
      setLoading(false);
    }
  }

  async function getMatch(job: Job) {
    setMatchingId(job.id);
    try {
      const res = await aiApi.jobMatch(DEFAULT_RESUME, job.title, job.description);
      setJobs(prev => prev.map(j => j.id === job.id
        ? { ...j, match_score: res.data.match_score, match_label: res.data.recommendation }
        : j));
    } finally {
      setMatchingId(null);
    }
  }

  async function trackJob(job: Job) {
    setTrackingId(job.id);
    try {
      await applicationsApi.create({ job_title: job.title, company: job.company, location: job.location, job_url: job.url, job_description: job.description, status: "Applied" });
      alert(`"${job.title}" added to tracker!`);
    } finally {
      setTrackingId(null);
    }
  }

  const scoreColor = (s: number) => s >= 80 ? "text-green-600 bg-green-50" : s >= 60 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Job Search</h1>
          <p className="page-sub">Find the latest opportunities matching your skills</p>
        </div>

        <div className="card p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--muted)" }} />
              <input className="input pl-9" placeholder="Job title or keywords" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div className="w-44 relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--muted)" }} />
              <input className="input pl-9" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={search} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Type:</span>
            {JOB_TYPES.map(t => (
              <button key={t} onClick={() => setJobType(t)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${jobType === t ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 dark:border-slate-600"}`}
                style={jobType !== t ? { color: "var(--muted)" } : {}}
              >{t || "All"}</button>
            ))}
          </div>
        </div>

        {!loading && jobs.length === 0 && (
          <div className="mb-5">
            <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Suggested for you:</p>
            <div className="flex flex-wrap gap-2">
              {["MLOps Engineer", "Cloud Engineer", "AI/ML Engineer", "Platform Engineer", "DevOps Engineer"].map(r => (
                <button key={r} onClick={() => setTitle(r)} className="badge bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer px-3 py-1 text-sm rounded-full">{r}</button>
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="card p-4 mb-4 flex items-start gap-3 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              <button onClick={search} className="text-xs text-red-600 dark:text-red-400 underline mt-1">Retry</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Searching jobs...</span>
            {slowNotice && (
              <span className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Still working — the backend may be waking up from sleep (free tier), this can take up to 50s on first load.
              </span>
            )}
          </div>
        )}

        {jobs.length > 0 && (
          <div>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>{jobs.length} jobs found</p>
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>{job.title}</h3>
                        {job.match_score !== undefined && (
                          <span className={`badge text-xs px-2 py-0.5 rounded-full font-semibold ${scoreColor(job.match_score)}`}>
                            {job.match_score}% match · {job.match_label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: "var(--muted)" }}>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        {job.salary && <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium"><DollarSign className="w-3 h-3" />{job.salary}</span>}
                        {job.job_type && <span className="badge bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5">{job.job_type}</span>}
                        <span className="badge bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs px-2 py-0.5">{job.source}</span>
                      </div>
                      <p className="mt-2 text-xs line-clamp-2" style={{ color: "var(--muted)" }}>{job.description}</p>
                      {job.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.tags.slice(0, 5).map(tag => (
                            <span key={tag} className="badge bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 text-xs px-2 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <a href={job.url} target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5"><ExternalLink className="w-3 h-3" />View</a>
                      <button onClick={() => getMatch(job)} disabled={matchingId === job.id} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                        {matchingId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-indigo-500" />}Match
                      </button>
                      <button onClick={() => trackJob(job)} disabled={trackingId === job.id} className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5">
                        {trackingId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}Track
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
