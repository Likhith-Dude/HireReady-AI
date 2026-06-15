"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Linkedin, Wand2, Loader2, Copy, TrendingUp } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Consulting", "E-commerce", "Cybersecurity", "AI/ML", "Cloud Computing", "Data Science", "DevOps"];

export default function LinkedInPage() {
  const [profile, setProfile] = useState("");
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    headline: string;
    summary: string;
    improvements: string[];
    keywords: string[];
    score_before: number;
    score_after: number;
  } | null>(null);
  const [copied, setCopied] = useState<"headline" | "summary" | null>(null);

  async function optimize() {
    if (!profile || !role) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/ai/linkedin-optimize`, {
        profile, target_role: role, industry,
      });
      setResult(data);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error optimizing profile");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, field: "headline" | "summary") {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
            <Linkedin size={32} className="text-blue-500" />
            LinkedIn Profile Optimizer
          </h1>
          <p style={{ color: "var(--muted)" }} className="mt-1">
            AI rewrites your headline and summary to attract recruiters for your target role
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Target Role *</label>
                  <input className="input w-full" placeholder="AI/ML Engineer" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Industry</label>
                  <select className="input w-full" value={industry} onChange={e => setIndustry(e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>
                Your Current LinkedIn Profile *
              </label>
              <textarea
                className="textarea w-full"
                rows={12}
                placeholder="Paste your current LinkedIn headline, about section, experience, and skills here..."
                value={profile}
                onChange={e => setProfile(e.target.value)}
              />
            </div>

            <button
              onClick={optimize}
              disabled={loading || !profile || !role}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {loading ? "Optimizing..." : "Optimize Profile"}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Score comparison */}
                <div className="card p-5">
                  <p className="text-xs font-semibold text-indigo-400 mb-3">PROFILE SCORE</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="text-3xl font-black text-red-400">{result.score_before}</div>
                      <div className="text-xs text-gray-500 mt-1">Before</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="text-3xl font-black text-green-400">{result.score_after}</div>
                      <div className="text-xs text-gray-500 mt-1">After</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <TrendingUp size={16} />
                    +{result.score_after - result.score_before} point improvement
                  </div>
                </div>

                {/* Headline */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-indigo-400">OPTIMIZED HEADLINE</p>
                    <button onClick={() => copy(result.headline, "headline")} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                      <Copy size={11} /> {copied === "headline" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="font-semibold" style={{ color: "var(--text)" }}>{result.headline}</p>
                </div>

                {/* Summary */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-indigo-400">OPTIMIZED ABOUT SECTION</p>
                    <button onClick={() => copy(result.summary, "summary")} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                      <Copy size={11} /> {copied === "summary" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>{result.summary}</p>
                </div>

                {/* Keywords */}
                <div className="card p-5">
                  <p className="text-xs font-semibold text-indigo-400 mb-3">KEYWORDS ADDED</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map(k => (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{k}</span>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div className="card p-5">
                  <p className="text-xs font-semibold text-indigo-400 mb-3">WHAT WAS IMPROVED</p>
                  <ul className="space-y-2">
                    {result.improvements.map((imp, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text)" }}>
                        <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="card p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]" style={{ color: "var(--muted)" }}>
                <Linkedin size={48} className="text-blue-500/30 mb-4" />
                <p className="font-medium">Paste your LinkedIn profile and target role</p>
                <p className="text-sm mt-1 opacity-70">AI will rewrite your headline and about section to get more recruiter views</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
