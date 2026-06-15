"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Plus, Trash2, TrendingUp, DollarSign, MapPin, Building2 } from "lucide-react";

interface Offer {
  id: number;
  company: string;
  role: string;
  base: number;
  bonus: number;
  equity: number;
  vestingYears: number;
  location: string;
  costOfLiving: number; // 100 = average US
  pto: number;
  remote: boolean;
  benefits: number; // estimated annual value
}

const DEFAULT_OFFER: Omit<Offer, "id"> = {
  company: "", role: "", base: 0, bonus: 0, equity: 0,
  vestingYears: 4, location: "", costOfLiving: 100, pto: 15,
  remote: false, benefits: 5000,
};

const COL_RANGES: Record<string, number> = {
  "San Francisco": 179, "New York": 187, "Seattle": 152, "Austin": 115,
  "Boston": 162, "Los Angeles": 173, "Chicago": 107, "Denver": 120,
  "Remote": 100, "Florida": 103, "Atlanta": 106,
};

function totalComp(o: Offer) {
  return o.base + o.bonus + (o.equity / o.vestingYears) + o.benefits;
}

function adjustedComp(o: Offer) {
  return Math.round((totalComp(o) / (o.costOfLiving / 100)));
}

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
}

function pct(val: number, max: number) {
  return max > 0 ? Math.min(100, (val / max) * 100) : 0;
}

export default function ComparePage() {
  const [offers, setOffers] = useState<Offer[]>([
    { id: 1, ...DEFAULT_OFFER, company: "Company A", role: "Software Engineer", base: 130000, bonus: 15000, equity: 80000, vestingYears: 4, location: "Remote", costOfLiving: 100, pto: 20, remote: true, benefits: 8000 },
    { id: 2, ...DEFAULT_OFFER, company: "Company B", role: "Software Engineer", base: 160000, bonus: 10000, equity: 120000, vestingYears: 4, location: "San Francisco", costOfLiving: 179, pto: 15, remote: false, benefits: 12000 },
  ]);

  function add() {
    const id = Date.now();
    setOffers(o => [...o, { id, ...DEFAULT_OFFER, company: `Offer ${o.length + 1}` }]);
  }

  function remove(id: number) {
    setOffers(o => o.filter(x => x.id !== id));
  }

  function update(id: number, field: keyof Offer, value: string | number | boolean) {
    setOffers(o => o.map(x => {
      if (x.id !== id) return x;
      const updated = { ...x, [field]: value };
      if (field === "location" && typeof value === "string" && COL_RANGES[value]) {
        updated.costOfLiving = COL_RANGES[value];
      }
      return updated;
    }));
  }

  const maxTC = Math.max(...offers.map(totalComp), 1);
  const maxAdj = Math.max(...offers.map(adjustedComp), 1);
  const colors = ["indigo", "purple", "cyan", "emerald", "pink"];
  const colorMap: Record<string, { bar: string; text: string; border: string }> = {
    indigo: { bar: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500" },
    purple: { bar: "bg-purple-500", text: "text-purple-400", border: "border-purple-500" },
    cyan:   { bar: "bg-cyan-500",   text: "text-cyan-400",   border: "border-cyan-500" },
    emerald:{ bar: "bg-emerald-500",text: "text-emerald-400",border: "border-emerald-500" },
    pink:   { bar: "bg-pink-500",   text: "text-pink-400",   border: "border-pink-500" },
  };

  const bestTC = offers.reduce((a, b) => totalComp(a) > totalComp(b) ? a : b, offers[0]);
  const bestAdj = offers.reduce((a, b) => adjustedComp(a) > adjustedComp(b) ? a : b, offers[0]);

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Offer Comparison</h1>
            <p style={{ color: "var(--muted)" }} className="mt-1">Compare total compensation adjusted for cost of living</p>
          </div>
          <button onClick={add} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Offer
          </button>
        </div>

        {/* Summary cards */}
        {offers.length >= 2 && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="card p-4">
              <p className="text-xs text-indigo-400 font-semibold mb-1">HIGHEST TOTAL COMP</p>
              <p className="text-2xl font-black" style={{ color: "var(--text)" }}>{bestTC?.company}</p>
              <p className="text-indigo-400 font-bold">{fmt(totalComp(bestTC!))} / yr</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{bestTC?.role} · {bestTC?.location}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-green-400 font-semibold mb-1">BEST ADJUSTED (COST OF LIVING)</p>
              <p className="text-2xl font-black" style={{ color: "var(--text)" }}>{bestAdj?.company}</p>
              <p className="text-green-400 font-bold">{fmt(adjustedComp(bestAdj!))} effective / yr</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{bestAdj?.location} · CoL index: {bestAdj?.costOfLiving}</p>
            </div>
          </div>
        )}

        {/* Bar chart comparison */}
        {offers.length >= 1 && (
          <div className="card p-6 mb-8">
            <h2 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Total Compensation Comparison</h2>
            <div className="space-y-5">
              {offers.map((o, i) => {
                const c = colorMap[colors[i % colors.length]];
                const tc = totalComp(o);
                const adj = adjustedComp(o);
                return (
                  <div key={o.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{o.company || `Offer ${i+1}`}</span>
                        {o.remote && <span className="ml-2 text-xs text-green-400 font-medium">Remote</span>}
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-sm ${c.text}`}>{fmt(tc)}</span>
                        <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>adj: {fmt(adj)}</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${pct(tc, maxTC)}%` }} />
                    </div>
                    <div className="flex gap-4 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                      <span>Base: {fmt(o.base)}</span>
                      {o.bonus > 0 && <span>Bonus: {fmt(o.bonus)}</span>}
                      {o.equity > 0 && <span>Equity: {fmt(o.equity / o.vestingYears)}/yr</span>}
                      <span>Benefits: {fmt(o.benefits)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Offer input cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {offers.map((o, i) => {
            const c = colorMap[colors[i % colors.length]];
            return (
              <div key={o.id} className={`card p-5 border-t-2 ${c.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${c.bar}`} />
                    <input
                      className="font-bold text-lg bg-transparent border-none outline-none"
                      style={{ color: "var(--text)" }}
                      value={o.company}
                      onChange={e => update(o.id, "company", e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  {offers.length > 1 && (
                    <button onClick={() => remove(o.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Role", field: "role", type: "text", placeholder: "Job Title" },
                    { label: "Location", field: "location", type: "text", placeholder: "City or Remote" },
                    { label: "Base Salary ($)", field: "base", type: "number", placeholder: "130000" },
                    { label: "Annual Bonus ($)", field: "bonus", type: "number", placeholder: "15000" },
                    { label: "Total Equity ($)", field: "equity", type: "number", placeholder: "80000" },
                    { label: "Vesting (years)", field: "vestingYears", type: "number", placeholder: "4" },
                    { label: "Benefits Value ($)", field: "benefits", type: "number", placeholder: "8000" },
                    { label: "PTO Days", field: "pto", type: "number", placeholder: "20" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>{f.label}</label>
                      <input
                        type={f.type}
                        className="input w-full text-sm"
                        placeholder={f.placeholder}
                        value={(o as any)[f.field] || ""}
                        onChange={e => update(o.id, f.field as keyof Offer, f.type === "number" ? Number(e.target.value) : e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-2">
                    <label className="text-xs" style={{ color: "var(--muted)" }}>Cost of Living Index (100 = US avg)</label>
                    <input type="number" className="input w-20 text-sm ml-auto" value={o.costOfLiving}
                      onChange={e => update(o.id, "costOfLiving", Number(e.target.value))} />
                  </div>
                </div>

                <div className={`mt-4 p-3 rounded-xl text-center border ${c.border} bg-opacity-5`}>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Total Comp</p>
                  <p className={`text-2xl font-black ${c.text}`}>{fmt(totalComp(o))}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Adj for CoL: <span className="text-green-400 font-bold">{fmt(adjustedComp(o))}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-center mt-6" style={{ color: "var(--muted)" }}>
          Cost of living data is approximate. Reference: SF=179, NYC=187, Seattle=152, Austin=115, Remote=100
        </p>
      </div>
    </AppShell>
  );
}
