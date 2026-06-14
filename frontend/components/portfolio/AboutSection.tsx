'use client';
import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const SKILLS = [
  { name: 'Python / FastAPI', pct: 95, color: 'from-indigo-500 to-purple-500' },
  { name: 'Machine Learning / MLOps', pct: 92, color: 'from-purple-500 to-pink-500' },
  { name: 'AWS / Cloud Infrastructure', pct: 88, color: 'from-cyan-500 to-blue-500' },
  { name: 'Docker / Kubernetes', pct: 85, color: 'from-blue-500 to-indigo-500' },
  { name: 'Next.js / TypeScript', pct: 80, color: 'from-indigo-400 to-cyan-400' },
  { name: 'SQL / PostgreSQL', pct: 82, color: 'from-green-500 to-cyan-500' },
];

const STATS = [
  { value: '3', label: 'Projects Built', suffix: '' },
  { value: '3.867', label: 'GPA', suffix: '' },
  { value: '56', label: 'Files Shipped', suffix: '+' },
  { value: '10', label: 'Systems Built', suffix: '' },
];

function SkillBar({ name, pct, color, delay }: { name: string; pct: number; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-1.5">
        <span className="text-gray-300 text-sm font-medium">{name}</span>
        <span className="text-indigo-400 text-sm font-bold">{pct}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg`}
        />
      </div>
    </div>
  );
}

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-32 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-indigo-950/10 to-[#030712]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.3em]">About Me</span>
          <h2 className="text-5xl font-black text-white mt-3">
            The{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Story
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start" ref={ref}>
          {/* Left — Story */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {/* Geometric Avatar */}
            <div className="relative w-48 h-48 mx-auto md:mx-0 mb-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-3xl border-2 border-indigo-500/40"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-2xl border-2 border-purple-500/40"
              />
              <div className="absolute inset-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                <span className="text-4xl font-black text-white">LD</span>
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
            </div>

            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                Hey — I'm <span className="text-white font-semibold">Likhith Dude</span>, an M.S. Computer Science
                student at <span className="text-indigo-400 font-semibold">Florida Atlantic University</span> (3.867 GPA),
                originally from India, now building AI products in the US.
              </p>
              <p>
                I specialize in the overlap of <span className="text-purple-400">ML Engineering</span>,{' '}
                <span className="text-cyan-400">Cloud Infrastructure</span>, and{' '}
                <span className="text-indigo-400">Full-Stack Development</span> — the rare engineer who can train a model,
                deploy it to AWS, and ship the frontend to go with it.
              </p>
              <p>
                I've published research at <span className="text-white font-semibold">ICCCAI-2024</span>, built
                fraud detection pipelines hitting <span className="text-green-400 font-semibold">F1 98.49%</span>,
                and shipped this very platform you're looking at.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-4 rounded-2xl border border-white/5 bg-white/3 backdrop-blur text-center group hover:border-indigo-500/40 transition-colors"
                >
                  <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {s.value}{s.suffix}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Skills */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-white mb-8">Technical Proficiency</h3>
            {SKILLS.map((s, i) => (
              <SkillBar key={s.name} {...s} delay={0.3 + i * 0.1} />
            ))}

            <div className="mt-10 p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
              <p className="text-indigo-300 text-sm leading-relaxed">
                🎓 M.S. Computer Science — Florida Atlantic University (2024–2026)<br />
                🎓 B.E. — Sathyabama University (2020–2024)<br />
                📄 Published: ICCCAI-2024 International Conference<br />
                🌍 From India · Based in Florida, USA
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
