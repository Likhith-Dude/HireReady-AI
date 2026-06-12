"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { aiApi, DEFAULT_RESUME } from "@/lib/api";
import { MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Question {
  question: string;
  answer: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Behavioral: "bg-blue-50 text-blue-700 border-blue-200",
  Technical: "bg-purple-50 text-purple-700 border-purple-200",
  Situational: "bg-amber-50 text-amber-700 border-amber-200",
  "Culture Fit": "bg-green-50 text-green-700 border-green-200",
};

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function generate() {
    if (!jobTitle || !company) return alert("Enter job title and company");
    setLoading(true);
    setQuestions([]);
    try {
      const res = await aiApi.interviewPrep({ job_title: jobTitle, company, job_description: jobDesc, resume_text: resume });
      setQuestions(res.data.questions);
      setExpanded(0);
    } catch (e: any) {
      alert("Error: " + (e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Prep</h1>
          <p className="text-gray-500 mt-1">Get top 10 interview questions with AI-crafted answers</p>
        </div>

        <div className="card p-5 mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Job Title *</label>
              <input className="input" placeholder="e.g. MLOps Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Company *</label>
              <input className="input" placeholder="e.g. Amazon" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Job Description (optional)</label>
            <textarea className="textarea" rows={4} placeholder="Paste job description for more targeted questions..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>
          <details className="text-sm">
            <summary className="text-gray-500 cursor-pointer select-none">Customize resume context</summary>
            <textarea className="textarea mt-2" rows={5} value={resume} onChange={(e) => setResume(e.target.value)} />
          </details>
        </div>

        <button className="btn-primary flex items-center gap-2 text-base px-6 py-3 mb-8" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
          {loading ? "Generating questions..." : "Generate Interview Questions"}
        </button>

        {questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top 10 Interview Questions</h2>
              <div className="flex gap-2">
                {["Behavioral", "Technical", "Situational", "Culture Fit"].map((cat) => (
                  <span key={cat} className={`badge border text-xs px-2 py-0.5 ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-600"}`}>{cat}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="card overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`badge border text-xs px-2 py-0.5 ${CATEGORY_COLORS[q.category] || "bg-gray-100 text-gray-600"}`}>{q.category}</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm leading-snug">{q.question}</p>
                    </div>
                    {expanded === i ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {expanded === i && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="mt-3 bg-indigo-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">Sample Answer</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
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
