"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { FileText, Wand2, Copy, Download, Loader2, ChevronDown } from "lucide-react";
import { DEFAULT_RESUME } from "@/lib/api";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TONES = ["professional", "enthusiastic", "confident", "creative", "concise"];

export default function CoverLetterPage() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState<{
    cover_letter: string; subject_line: string; key_points: string[];
  } | null>(null);
  const [streamText, setStreamText] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(stream = false) {
    if (!jobTitle || !company) return;
    setResult(null);
    setStreamText("");

    if (stream) {
      setStreaming(true);
      const res = await fetch(`${API}/ai/cover-letter/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, job_title: jobTitle, company, job_description: jobDesc, tone }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") { setStreaming(false); break; }
            try { full += JSON.parse(data).text; setStreamText(full); } catch {}
          }
        }
      }
      setStreaming(false);
    } else {
      setLoading(true);
      try {
        const { data } = await axios.post(`${API}/ai/cover-letter`, {
          resume_text: resume, job_title: jobTitle, company, job_description: jobDesc, tone,
        });
        setResult(data);
      } catch (e: any) {
        alert(e?.response?.data?.detail || "Error generating cover letter");
      } finally {
        setLoading(false);
      }
    }
  }

  function copy() {
    const text = result?.cover_letter || streamText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const text = result?.cover_letter || streamText;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cover-letter-${company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
  }

  const coverText = result?.cover_letter || streamText;

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
            AI Cover Letter Generator
          </h1>
          <p style={{ color: "var(--muted)" }} className="mt-1">
            Tailored, recruiter-ready cover letters in seconds — powered by Groq AI
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left — Inputs */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Job Details</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Title *</label>
                  <input className="input w-full" placeholder="Software Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Company *</label>
                  <input className="input w-full" placeholder="Google" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
              </div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Description</label>
              <textarea className="textarea w-full" rows={4} placeholder="Paste the job description..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            </div>

            <div className="card p-5">
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--muted)" }}>Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${
                      tone === t ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Your Resume</label>
              <textarea className="textarea w-full text-xs" rows={6} value={resume} onChange={e => setResume(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => generate(false)}
                disabled={loading || streaming || !jobTitle || !company}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                {loading ? "Generating..." : "Generate"}
              </button>
              <button
                onClick={() => generate(true)}
                disabled={loading || streaming || !jobTitle || !company}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {streaming ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {streaming ? "Streaming..." : "Stream Live"}
              </button>
            </div>
          </div>

          {/* Right — Output */}
          <div className="space-y-4">
            {result?.subject_line && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-indigo-400 mb-1">EMAIL SUBJECT LINE</p>
                <p className="font-medium" style={{ color: "var(--text)" }}>{result.subject_line}</p>
              </div>
            )}

            {result?.key_points && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-indigo-400 mb-2">WHY YOU'RE A STRONG FIT</p>
                <ul className="space-y-1">
                  {result.key_points.map((p, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text)" }}>
                      <span className="text-green-400 flex-shrink-0">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-indigo-400">COVER LETTER</p>
                {coverText && (
                  <div className="flex gap-2">
                    <button onClick={copy} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                      <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={download} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                      <Download size={12} /> .txt
                    </button>
                  </div>
                )}
              </div>
              {coverText ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>
                  {coverText}
                  {streaming && <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-center" style={{ color: "var(--muted)" }}>
                  <div>
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Fill in the job details and click Generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
