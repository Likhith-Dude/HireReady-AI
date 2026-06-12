"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/auth";
import { Briefcase, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(email, name, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>HireReady AI</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Your AI job hunting co-pilot</p>
        </div>

        <div className="card p-6">
          <div className="flex rounded-lg p-1 mb-5" style={{ background: "var(--bg)" }}>
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m ? "bg-indigo-600 text-white shadow-sm" : ""
                }`}
                style={mode !== m ? { color: "var(--muted)" } : {}}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Full Name</label>
                <input className="input" placeholder="Likhith Dude" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded p-2">{error}</p>}
            <button className="btn-primary w-full flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => router.push("/")} className="text-xs text-indigo-500 hover:underline">
              Continue without account →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
