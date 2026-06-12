"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { aiApi } from "@/lib/api";
import { DollarSign, Loader2, TrendingUp, Building2, Lightbulb } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SalaryResult {
  min_salary: number; median_salary: number; max_salary: number; currency: string;
  factors: string[]; market_trend: string; top_paying_companies: string[];
  negotiation_tips: string[]; summary: string;
}

const TREND_STYLE: Record<string, string> = {
  Hot: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  Growing: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  Stable: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  Declining: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300",
};

function fmt(n: number) { return "$" + (n >= 1000 ? (n / 1000).toFixed(0) + "k" : n); }

export default function SalaryPage() {
  const [jobTitle, setJobTitle] = useState("MLOps Engineer");
  const [location, setLocation] = useState("United States");
  const [skills, setSkills] = useState("Python, AWS, Kubernetes, MLflow");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalaryResult | null>(null);

  async function lookup() {
    if (!jobTitle) return;
    setLoading(true); setResult(null);
    try {
      const skillList = skills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await aiApi.salaryInsights(jobTitle, location, skillList);
      setResult(res.data);
    } catch (e: any) { alert("Error: " + (e?.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  const chartData = result ? [
    { name: "Min", value: result.min_salary, fill: "#94a3b8" },
    { name: "Median", value: result.median_salary, fill: "#6366f1" },
    { name: "Max", value: result.max_salary, fill: "#22c55e" },
  ] : [];

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Salary Insights</h1>
          <p className="page-sub">AI-powered compensation data for any role</p>
        </div>

        <div className="card p-5 mb-5">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Job Title *</label>
              <input className="input" placeholder="e.g. MLOps Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
            <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Location</label>
              <input className="input" placeholder="e.g. United States" value={location} onChange={e => setLocation(e.target.value)} /></div>
            <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Your Skills</label>
              <input className="input" placeholder="Python, AWS, Docker..." value={skills} onChange={e => setSkills(e.target.value)} /></div>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5" onClick={lookup} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            {loading ? "Analyzing market…" : "Get Salary Insights"}
          </button>
        </div>

        {result && (
          <div className="space-y-5">
            {/* Salary range cards */}
            <div className="grid grid-cols-3 gap-4">
              {[{ l: "Entry / Min", v: result.min_salary, c: "text-slate-600 dark:text-slate-300" },
                { l: "Market Median", v: result.median_salary, c: "text-indigo-600 dark:text-indigo-400" },
                { l: "Senior / Max", v: result.max_salary, c: "text-green-600 dark:text-green-400" }].map(({ l, v, c }) => (
                <div key={l} className="card p-5 text-center">
                  <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{l}</p>
                  <p className={`text-2xl font-bold ${c}`}>{fmt(v)}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>per year</p>
                </div>
              ))}
            </div>

            {/* Chart + trend */}
            <div className="grid grid-cols-3 gap-5">
              <div className="card p-5 col-span-2">
                <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Salary Range Chart</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barSize={48}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), "Salary"]} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Market Trend</h3>
                <span className={`badge text-sm font-semibold px-3 py-1.5 rounded-lg ${TREND_STYLE[result.market_trend] || TREND_STYLE.Stable}`}>
                  <TrendingUp className="w-3.5 h-3.5 inline mr-1" />{result.market_trend}
                </span>
                <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>{result.summary}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: "var(--text)" }}>
                  <Building2 className="w-4 h-4 text-indigo-500" />Top Paying Companies
                </h3>
                <ol className="space-y-2">
                  {result.top_paying_companies.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                      <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>{c}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: "var(--text)" }}>
                  <Lightbulb className="w-4 h-4 text-amber-500" />Negotiation Tips
                </h3>
                <ul className="space-y-2">
                  {result.negotiation_tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Salary Factors</h3>
              <div className="flex flex-wrap gap-2">
                {result.factors.map((f, i) => (
                  <span key={i} className="badge bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-3 py-1">{f}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
