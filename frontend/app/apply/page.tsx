"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { aiApi, applicationsApi, DEFAULT_RESUME } from "@/lib/api";
import { Zap, Loader2, Copy, CheckCircle, FileText, Mail } from "lucide-react";

export default function OneClickApplyPage() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tailored_resume: string; cover_letter: string } | null>(null);
  const [copied, setCopied] = useState<"resume" | "cover" | null>(null);
  const [saved, setSaved] = useState(false);

  async function apply() {
    if (!jobTitle || !company || !jobDesc) return alert("Fill in all fields");
    setLoading(true);
    setResult(null);
    try {
      const res = await aiApi.oneClickApply({
        resume_text: resume,
        job_title: jobTitle,
        company,
        job_description: jobDesc,
      });
      setResult(res.data);
    } catch (e: any) {
      alert("AI error: " + (e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  }

  async function saveToTracker() {
    if (!result) return;
    await applicationsApi.create({
      job_title: jobTitle,
      company,
      job_description: jobDesc,
      tailored_resume: result.tailored_resume,
      cover_letter: result.cover_letter,
      status: "Applied",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function copyText(text: string, type: "resume" | "cover") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">One Click Apply</h1>
          <p className="text-gray-500 mt-1">AI tailors your resume and writes a cover letter instantly</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="card p-5 col-span-2">
            <h2 className="font-semibold mb-3 text-gray-800">Job Details</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Job Title *</label>
                <input className="input" placeholder="e.g. MLOps Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Company *</label>
                <input className="input" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Job Description *</label>
            <textarea className="textarea" rows={5} placeholder="Paste the full job description here..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>

          <div className="card p-5 col-span-2">
            <h2 className="font-semibold mb-3 text-gray-800">Your Resume</h2>
            <textarea className="textarea" rows={8} value={resume} onChange={(e) => setResume(e.target.value)} />
          </div>
        </div>

        <button
          className="btn-primary flex items-center gap-2 text-base px-6 py-3 mb-8"
          onClick={apply}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          {loading ? "AI is crafting your application..." : "One Click Apply"}
        </button>

        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Application Ready!
              </h2>
              <button
                onClick={saveToTracker}
                className={saved ? "btn-secondary text-green-600 border-green-300" : "btn-secondary"}
              >
                {saved ? "✓ Saved to Tracker" : "+ Save to Tracker"}
              </button>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Tailored Resume
                </h3>
                <button onClick={() => copyText(result.tailored_resume, "resume")} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> {copied === "resume" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 font-mono leading-relaxed">{result.tailored_resume}</pre>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" /> Cover Letter
                </h3>
                <button onClick={() => copyText(result.cover_letter, "cover")} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> {copied === "cover" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 leading-relaxed">{result.cover_letter}</div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
