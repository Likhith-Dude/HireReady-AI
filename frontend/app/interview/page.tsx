"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import ResumeUpload from "@/components/ResumeUpload";
import { aiApi, DEFAULT_RESUME } from "@/lib/api";
import { MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Question { question: string; answer: string; category: string; }

const CAT: Record<string, string> = {
  Behavioral: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Technical: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Situational: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Culture Fit": "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
};

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<number | null>(0);

  async function generate() {
    if (!jobTitle || !company) return alert("Enter job title and company");
    setLoading(true); setQuestions([]);
    try {
      const res = await aiApi.interviewPrep({ job_title: jobTitle, company, job_description: jobDesc, resume_text: resume });
      setQuestions(res.data.questions); setExpanded(0);
    } catch (e: any) { alert("Error: " + (e?.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Interview Prep</h1>
          <p className="page-sub">Top 10 questions with AI-crafted STAR answers</p>
        </div>

        <div className="card p-5 mb-5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Title *</label>
              <input className="input" placeholder="e.g. MLOps Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
            <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Company *</label>
              <input className="input" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} /></div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Description (optional)</label>
            <textarea className="textarea" rows={3} placeholder="Paste for more targeted questions..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer select-none text-xs" style={{ color: "var(--muted)" }}>Upload or edit resume context</summary>
            <div className="mt-2 space-y-2">
              <ResumeUpload onParsed={setResume} />
              <textarea className="textarea" rows={5} value={resume} onChange={e => setResume(e.target.value)} />
            </div>
          </details>
        </div>

        <button className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 mb-8" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          {loading ? "Generating questions…" : "Generate Interview Questions"}
        </button>

        {questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Top 10 Interview Questions</h2>
              <div className="flex gap-1.5">
                {["Behavioral", "Technical", "Situational", "Culture Fit"].map(c => (
                  <span key={c} className={`badge border text-xs px-2 py-0.5 ${CAT[c]}`}>{c}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="card overflow-hidden">
                  <button className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => setExpanded(expanded === i ? null : i)}>
                    <span className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`badge border text-xs px-1.5 py-0.5 mb-1 ${CAT[q.category] || "bg-gray-100 text-gray-600"}`}>{q.category}</span>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{q.question}</p>
                    </div>
                    {expanded === i ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />}
                  </button>
                  {expanded === i && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="mt-3 rounded-lg p-4" style={{ background: "var(--bg)" }}>
                        <p className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">Sample Answer</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>{q.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
