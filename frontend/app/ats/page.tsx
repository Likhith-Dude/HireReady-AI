"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { aiApi, DEFAULT_RESUME } from "@/lib/api";
import { BarChart2, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ATSResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  summary: string;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{score}</text>
        <text x="70" y="85" textAnchor="middle" fontSize="11" fill="#64748b">/ 100</text>
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
    setLoading(true);
    setResult(null);
    try {
      const res = await aiApi.atsCheck(resume, jobDesc);
      setResult(res.data);
    } catch (e: any) {
      alert("Error: " + (e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ATS Checker</h1>
          <p className="text-gray-500 mt-1">Score your resume against any job description</p>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="card p-5">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Resume</label>
            <textarea className="textarea" rows={12} value={resume} onChange={(e) => setResume(e.target.value)} />
          </div>
          <div className="card p-5">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Job Description</label>
            <textarea className="textarea" rows={12} placeholder="Paste the job description..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2 text-base px-6 py-3 mb-8" onClick={check} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart2 className="w-5 h-5" />}
          {loading ? "Analyzing..." : "Check ATS Score"}
        </button>

        {result && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-8">
                <ScoreRing score={result.score} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">ATS Analysis</h2>
                  <p className="text-gray-600">{result.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Matched Keywords ({result.matched_keywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matched_keywords.map((kw) => (
                    <span key={kw} className="badge bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs rounded">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-500" /> Missing Keywords ({result.missing_keywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw) => (
                    <span key={kw} className="badge bg-red-50 text-red-700 border border-red-200 px-2 py-1 text-xs rounded">{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Improvement Suggestions
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {s}
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
