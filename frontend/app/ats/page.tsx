"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import ResumeUpload from "@/components/ResumeUpload";
import { aiApi, DEFAULT_RESUME } from "@/lib/api";
import { BarChart2, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ATSResult {
  score: number; matched_keywords: string[]; missing_keywords: string[]; suggestions: string[]; summary: string;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  const r = 54; const circ = 2 * Math.PI * r; const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{score}</text>
        <text x="70" y="85" textAnchor="middle" fontSize="11" fill="var(--muted)">/ 100</text>
      </svg>
      <span className="font-semibold text-sm mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

export default function ATSCheckerPage() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  async function check() {
    if (!jobDesc) return alert("Paste a job description");
    setLoading(true); setResult(null);
    try {
      const res = await aiApi.atsCheck(resume, jobDesc);
      setResult(res.data);
    } catch (e: any) { alert("Error: " + (e?.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">ATS Checker</h1>
          <p className="page-sub">Score your resume against any job description</p>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="card p-5">
            <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--text)" }}>Your Resume</label>
            <div className="mb-3"><ResumeUpload onParsed={setResume} /></div>
            <textarea className="textarea" rows={10} value={resume} onChange={e => setResume(e.target.value)} />
          </div>
          <div className="card p-5">
            <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--text)" }}>Job Description</label>
            <textarea className="textarea" rows={14} placeholder="Paste the job description..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 mb-8" onClick={check} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
          {loading ? "Analyzing..." : "Check ATS Score"}
        </button>

        {result && (
          <div className="space-y-5">
            <div className="card p-6 flex items-center gap-8">
              <ScoreRing score={result.score} />
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>ATS Analysis Complete</h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{result.summary}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: "var(--text)" }}>
                  <CheckCircle className="w-4 h-4 text-green-500" /> Matched ({result.matched_keywords.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_keywords.map(kw => <span key={kw} className="badge bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs px-2 py-0.5">{kw}</span>)}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: "var(--text)" }}>
                  <XCircle className="w-4 h-4 text-red-500" /> Missing ({result.missing_keywords.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_keywords.map(kw => <span key={kw} className="badge bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs px-2 py-0.5">{kw}</span>)}
                </div>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: "var(--text)" }}>
                <AlertCircle className="w-4 h-4 text-amber-500" /> Suggestions
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
