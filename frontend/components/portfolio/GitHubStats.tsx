'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, BookOpen } from 'lucide-react';

interface GHUser { public_repos: number; followers: number; following: number; }
interface GHRepo { name: string; stargazers_count: number; forks_count: number; language: string; description: string; html_url: string; }

const USERNAME = 'Likhith-Dude';

export default function GitHubStats() {
  const [user, setUser] = useState<GHUser | null>(null);
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`).then(r => r.json()),
      fetch(`https://api.github.com/users/${USERNAME}/repos?sort=stars&per_page=4`).then(r => r.json()),
    ]).then(([u, r]) => {
      setUser(u);
      setRepos(Array.isArray(r) ? r : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const LANG_COLORS: Record<string, string> = {
    Python: '#3b82f6', TypeScript: '#8b5cf6', JavaScript: '#f59e0b',
    Go: '#06b6d4', Rust: '#f97316', default: '#6b7280',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-10"
    >
      <div className="flex items-center gap-3 mb-5">
        <Github size={20} className="text-indigo-400" />
        <h3 className="text-white font-bold">GitHub Activity</h3>
        <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer"
          className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          @{USERNAME} ↗
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/3 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Public Repos', value: user?.public_repos ?? '—', icon: BookOpen },
              { label: 'Total Stars', value: totalStars, icon: Star },
              { label: 'Followers', value: user?.followers ?? '—', icon: Github },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-3 rounded-2xl border border-white/5 bg-white/3 text-center">
                <Icon size={14} className="text-indigo-400 mx-auto mb-1" />
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-gray-600 text-[10px]">{label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {repos.map(repo => (
              <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3 transition-all group"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: LANG_COLORS[repo.language] || LANG_COLORS.default }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate group-hover:text-indigo-300 transition-colors">{repo.name}</p>
                  {repo.description && <p className="text-gray-600 text-[10px] truncate">{repo.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-gray-600">
                  <span className="flex items-center gap-0.5"><Star size={10} />{repo.stargazers_count}</span>
                  <span className="flex items-center gap-0.5"><GitFork size={10} />{repo.forks_count}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
