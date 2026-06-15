"use client";
import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { Mic, Send, RotateCcw, ChevronRight, Star, Loader2, Brain } from "lucide-react";
import { DEFAULT_RESUME } from "@/lib/api";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CATEGORIES = ["Technical", "Behavioral", "Situational", "Culture Fit"];

interface Question { question: string; category: string; hint: string; follow_up: string; }
interface Feedback { score: number; verdict: string; strengths: string[]; improvements: string[]; ideal_answer_points: string[]; follow_up_suggestion: string; }
interface Round { question: Question; answer: string; feedback: Feedback | null; }

const VERDICT_COLOR: Record<string, string> = {
  Excellent: "text-green-400", Good: "text-blue-400", "Needs Work": "text-yellow-400", Weak: "text-red-400",
};

export default function MockInterviewPage() {
  const [setup, setSetup] = useState({ jobTitle: "Software Engineer", company: "Google", resume: DEFAULT_RESUME });
  const [started, setStarted] = useState(false);
  const [catIdx, setCatIdx] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [rounds, currentQ]);

  async function startInterview() {
    setStarted(true);
    await fetchQuestion();
  }

  async function fetchQuestion() {
    setLoading(true);
    setShowHint(false);
    setAnswer("");
    try {
      const { data } = await axios.post<Question>(`${API}/ai/mock-interview/question`, {
        job_title: setup.jobTitle,
        company: setup.company,
        category: CATEGORIES[catIdx % CATEGORIES.length],
        resume_text: setup.resume,
        asked: rounds.map(r => r.question.question),
      });
      setCurrentQ(data);
      setCatIdx(i => i + 1);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error fetching question");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || !currentQ) return;
    setLoading(true);
    try {
      const { data } = await axios.post<Feedback>(`${API}/ai/mock-interview/feedback`, {
        question: currentQ.question,
        answer,
        job_title: setup.jobTitle,
      });
      setRounds(r => [...r, { question: currentQ, answer, feedback: data }]);
      setCurrentQ(null);
      setAnswer("");
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error getting feedback");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStarted(false);
    setRounds([]);
    setCurrentQ(null);
    setCatIdx(0);
    setAnswer("");
  }

  const avgScore = rounds.length > 0
    ? Math.round(rounds.filter(r => r.feedback).reduce((s, r) => s + (r.feedback!.score || 0), 0) / rounds.filter(r => r.feedback).length)
    : 0;

  if (!started) {
    return (
      <AppShell>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
              <Brain size={32} className="text-indigo-400" /> Mock Interview
            </h1>
            <p style={{ color: "var(--muted)" }} className="mt-1">AI-powered interview simulator with real-time feedback</p>
          </div>
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Title</label>
                <input className="input w-full" value={setup.jobTitle} onChange={e => setSetup(s => ({ ...s, jobTitle: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Company</label>
                <input className="input w-full" value={setup.company} onChange={e => setSetup(s => ({ ...s, company: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Your Resume (for tailored questions)</label>
              <textarea className="textarea w-full text-xs" rows={6} value={setup.resume} onChange={e => setSetup(s => ({ ...s, resume: e.target.value }))} />
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm" style={{ color: "var(--text)" }}>
              <p className="font-medium text-indigo-400 mb-1">How it works</p>
              <ul className="space-y-1 text-xs" style={{ color: "var(--muted)" }}>
                <li>• AI asks questions across Technical, Behavioral, Situational, and Culture Fit</li>
                <li>• Type your answer and get instant scored feedback (0–10)</li>
                <li>• See what great answers should include</li>
                <li>• Go as many rounds as you want</li>
              </ul>
            </div>
            <button onClick={startInterview} className="btn-primary w-full flex items-center justify-center gap-2">
              <Brain size={16} /> Start Interview
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              {setup.jobTitle} @ {setup.company}
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {rounds.length} question{rounds.length !== 1 ? "s" : ""} answered
              {rounds.length > 0 && <span className="ml-2 text-indigo-400 font-medium">Avg: {avgScore}/10</span>}
            </p>
          </div>
          <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
            <RotateCcw size={14} /> Restart
          </button>
        </div>

        {/* Past rounds */}
        <div className="space-y-4 mb-6">
          {rounds.map((r, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 mt-0.5">
                  {r.question.category}
                </span>
                <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{r.question.question}</p>
              </div>
              <div className="ml-0 p-3 rounded-lg mb-3 text-sm" style={{ background: "var(--border)", color: "var(--text)" }}>
                {r.answer}
              </div>
              {r.feedback && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, j) => (
                        <div key={j} className={`w-3 h-3 rounded-sm ${j < r.feedback!.score ? "bg-indigo-500" : "bg-gray-700"}`} />
                      ))}
                    </div>
                    <span className={`font-black text-lg ${VERDICT_COLOR[r.feedback.verdict] || "text-gray-400"}`}>
                      {r.feedback.score}/10 — {r.feedback.verdict}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-400 font-semibold mb-1">STRENGTHS</p>
                      {r.feedback.strengths.map((s, j) => <p key={j} className="text-xs flex gap-1.5" style={{ color: "var(--muted)" }}><span className="text-green-400">✓</span>{s}</p>)}
                    </div>
                    <div>
                      <p className="text-xs text-yellow-400 font-semibold mb-1">IMPROVE</p>
                      {r.feedback.improvements.map((s, j) => <p key={j} className="text-xs flex gap-1.5" style={{ color: "var(--muted)" }}><span className="text-yellow-400">→</span>{s}</p>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold mb-1">IDEAL ANSWER SHOULD COVER</p>
                    {r.feedback.ideal_answer_points.map((p, j) => <p key={j} className="text-xs flex gap-1.5" style={{ color: "var(--muted)" }}><span className="text-indigo-400">•</span>{p}</p>)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Current question */}
          {currentQ && (
            <div className="card p-5 border border-indigo-500/30">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0 mt-0.5">
                  {currentQ.category}
                </span>
                <p className="font-semibold" style={{ color: "var(--text)" }}>{currentQ.question}</p>
              </div>

              {showHint && (
                <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                  💡 {currentQ.hint}
                </div>
              )}

              <textarea
                className="textarea w-full mb-3"
                rows={5}
                placeholder="Type your answer here. Be specific — use examples, numbers, and outcomes..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                autoFocus
              />

              <div className="flex gap-3">
                <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? "Evaluating..." : "Submit Answer"}
                </button>
                <button onClick={() => setShowHint(h => !h)} className="btn-secondary text-sm">
                  {showHint ? "Hide Hint" : "Show Hint"}
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Next question button */}
        {!currentQ && !loading && (
          <button onClick={fetchQuestion} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {rounds.length === 0 ? "Get First Question" : "Next Question"}
          </button>
        )}
      </div>
    </AppShell>
  );
}
