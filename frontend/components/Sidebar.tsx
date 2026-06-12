"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Zap, BarChart2, MessageSquare, ClipboardList, Briefcase, Moon, Sun, DollarSign, LogOut, User } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { getUser, clearAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Job Search", icon: Search },
  { href: "/apply", label: "One Click Apply", icon: Zap },
  { href: "/ats", label: "ATS Checker", icon: BarChart2 },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare },
  { href: "/salary", label: "Salary Insights", icon: DollarSign },
  { href: "/tracker", label: "App Tracker", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => { setUser(getUser()); }, []);

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: "var(--sidebar)" }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg text-white leading-tight">HireReady AI</p>
            <p className="text-indigo-300 text-xs">Job Hunting Co-Pilot</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? "bg-indigo-600 text-white shadow-md" : "text-indigo-200 hover:text-white"
              }`}
              style={!active ? { ":hover": { background: "var(--sidebar-hover)" } } as React.CSSProperties : {}}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* User info */}
        {user ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-400 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="text-indigo-400 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-300 hover:text-white text-xs transition-colors">
            <User className="w-3.5 h-3.5" /> Sign in
          </Link>
        )}

        {/* Dark mode toggle */}
        <button onClick={toggle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-300 hover:text-white text-xs transition-colors"
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = ""}
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="text-xs text-indigo-500 text-center pt-1">Powered by HireReady AI</div>
      </div>
    </aside>
  );
}
