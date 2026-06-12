"use client";
import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";
import ResumeUpload from "@/components/ResumeUpload";
import { applicationsApi, DEFAULT_RESUME } from "@/lib/api";
import { Zap, Loader2, Copy, CheckCircle, FileText, Mail, ToggleLeft, ToggleRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function OneClickApplyPage() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState<{ tailored_resume: string; cover_letter: string } | null>(null);
  const [copied, setCopied] = useState<"resume" | "cover" | null>(null);
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function applyStream() {
    setLoading(true); setStreamText(""); setResult(null);
    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${API}/ai/one-click-apply/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, job_title: jobTitle, company, job_description: jobDesc }),
        signal: abortRef.current.signal,
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try { const d = JSON.parse(line.slice(6)); full += d.text; setStreamText(full); } catch {}
          }
        }
      }
      // Parse sections from streamed text
      const resumeMatch = full.match(/## TAILORED RESUME\s*([\s\S]*?)(?=## COVER LETTER|$)/);
      const coverMatch = full.match(/## COVER LETTER\s*([\s\S]*?)$/);
      setResult({ tailored_resume: resumeMatch?.[1]?.trim() || full, cover_letter: coverMatch?.[1]?.trim() || "" });
    } catch (e: any) {
      if (e.name !== "AbortError") alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function applyDirect() {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/ai/one-click-apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, job_title: jobTitle, company, job_description: jobDesc }),
      });
      setResult(await res.json());
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setLoading(false); }
  }

  async function apply() {
    if (!jobTitle || !company || !jobDesc) return alert("Fill in job title, company, and description");
    streaming ? await applyStream() : await applyDirect();
  }

  async function saveToTracker() {
    if (!result) return;
    await applicationsApi.create({ job_title: jobTitle, company, job_description: jobDesc, tailored_resume: result.tailored_resume, cover_letter: result.cover_letter, status: "Applied" });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  function copy(text: string, type: "resume" | "cover") {
    navigator.clipboard.writeText(text); setCopied(type); setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">One Click Apply</h1>
          <p className="page-sub">AI tailors your resume and writes a cover letter instantly</p>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="card p-5 col-span-2">
            <h2 className="font-semibold mb-3 text-sm" style={{ color: "var(--text)" }}>Job Details</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Title *</label>
                <input className="input" placeholder="e.g. MLOps Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
              <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Company *</label>
                <input className="input" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} /></div>
            </div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Description *</label>
            <textarea className="textarea" rows={4} placeholder="Paste the full job description..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
          </div>

          <div className="card p-5 col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Your Resume</h2>
              <div className="text-xs" style={{ color: "var(--muted)" }}>Upload file or paste below</div>
            </div>
            <div className="mb-3"><ResumeUpload onParsed={setResume} /></div>
            <textarea className="textarea" rows={7} value={resume} onChange={e => setResume(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5" onClick={apply} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? (streaming ? "AI is writing…" : "Processing…") : "One Click Apply"}
          </button>
          <button onClick={() => setStreaming(!streaming)} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
            {streaming ? <ToggleRight className="w-4 h-4 text-indigo-500" /> : <ToggleLeft className="w-4 h-4" />}
            Streaming {streaming ? "on" : "off"}
          </button>
        </div>

        {/* Live stream output */}
        {loading && streaming && streamText && (
          <div className="card p-5 mb-5">
            <p className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">AI Writing Live…</p>
            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed cursor-blink" style={{ color: "var(--text)" }}>{streamText}</pre>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <CheckCircle className="w-5 h-5 text-green-500" /> Application Ready!
              </h2>
              <button onClick={saveToTracker} className={`btn-secondary text-sm ${saved ? "text-green-600 border-green-300" : ""}`}>
                {saved ? "✓ Saved" : "+ Save to Tracker"}
              </button>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--text)" }}><FileText className="w-4 h-4 text-indigo-500" />Tailored Resume</h3>
                <button onClick={() => copy(result.tailored_resume, "resume")} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Copy className="w-3 h-3" />{copied === "resume" ? "Copied!" : "Copy"}</button>
              </div>
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed rounded-lg p-4" style={{ background: "var(--bg)", color: "var(--text)" }}>{result.tailored_resume}</pre>
            </div>
            {result.cover_letter && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--text)" }}><Mail className="w-4 h-4 text-indigo-500" />Cover Letter</h3>
                  <button onClick={() => copy(result.cover_letter, "cover")} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Copy className="w-3 h-3" />{copied === "cover" ? "Copied!" : "Copy"}</button>
                </div>
                <div className="text-sm leading-relaxed rounded-lg p-4 whitespace-pre-wrap" style={{ background: "var(--bg)", color: "var(--text)" }}>{result.cover_letter}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
