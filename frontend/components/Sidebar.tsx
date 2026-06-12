"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Zap, BarChart2, MessageSquare, ClipboardList, Briefcase
} from "lucide-react";

const nav = [
  { href: "/", label: "Job Search", icon: Search },
  { href: "/apply", label: "One Click Apply", icon: Zap },
  { href: "/ats", label: "ATS Checker", icon: BarChart2 },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare },
  { href: "/tracker", label: "App Tracker", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col">
      <div className="p-6 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-400 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">HireReady AI</p>
            <p className="text-indigo-300 text-xs">Likhith Dude</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-indigo-700">
        <div className="text-xs text-indigo-400 text-center">
          Powered by Google Gemini AI
        </div>
      </div>
    </aside>
  );
}
