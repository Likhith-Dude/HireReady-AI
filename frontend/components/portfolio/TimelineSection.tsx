'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, BookOpen, Cpu, Briefcase, Award } from 'lucide-react';

const EVENTS = [
  {
    year: '2020',
    title: 'B.E. Computer Science',
    org: 'Sathyabama University, India',
    desc: 'Built foundation in algorithms, data structures, and software engineering. Graduated with distinction.',
    icon: GraduationCap,
    color: 'from-blue-600 to-cyan-600',
    glow: 'rgba(6,182,212,0.4)',
    tags: ['Data Structures', 'Algorithms', 'Java', 'C++'],
  },
  {
    year: '2023',
    title: 'Research Paper — ICCCAI-2024',
    org: 'International Conference on Computing, Communication & AI',
    desc: 'Published research on machine learning applications in real-world systems. Presented findings to an international audience.',
    icon: BookOpen,
    color: 'from-purple-600 to-pink-600',
    glow: 'rgba(139,92,246,0.4)',
    tags: ['ML Research', 'Published', 'International'],
  },
  {
    year: '2024',
    title: 'MLOps Fraud Detection Engine',
    org: 'Personal Project',
    desc: 'Engineered end-to-end MLOps pipeline with feature engineering, XGBoost ensemble, and FastAPI inference. Achieved F1 score of 98.49%.',
    icon: Cpu,
    color: 'from-indigo-600 to-purple-600',
    glow: 'rgba(99,102,241,0.4)',
    tags: ['MLOps', 'XGBoost', 'FastAPI', 'F1: 98.49%'],
  },
  {
    year: '2024',
    title: 'M.S. Computer Science',
    org: 'Florida Atlantic University, USA',
    desc: 'Pursuing advanced studies in AI, cloud computing, and distributed systems. Current GPA: 3.867. Expected graduation 2026.',
    icon: GraduationCap,
    color: 'from-cyan-600 to-blue-600',
    glow: 'rgba(6,182,212,0.4)',
    tags: ['GPA: 3.867', 'AI/ML', 'Cloud', 'FAU'],
  },
  {
    year: '2025',
    title: 'Cloud Cost Optimization Engine',
    org: 'Personal Project',
    desc: 'Built ML-powered AWS cost intelligence platform with anomaly detection, predictive forecasting, and automated recommendations.',
    icon: Award,
    color: 'from-green-600 to-cyan-600',
    glow: 'rgba(16,185,129,0.4)',
    tags: ['AWS', 'ML', 'F1: 100%', 'Cost Optimization'],
  },
  {
    year: '2025',
    title: 'HireReady AI Platform',
    org: 'Personal Project',
    desc: '56-file production platform: 7-source job aggregation, Groq AI, WebSockets, resume parsing, H1B database, and 30 API endpoints.',
    icon: Briefcase,
    color: 'from-purple-600 to-indigo-600',
    glow: 'rgba(99,102,241,0.4)',
    tags: ['Full-Stack', 'Groq AI', 'Next.js', 'FastAPI'],
  },
];

function TimelineItem({ event, idx }: { event: typeof EVENTS[0]; idx: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = idx % 2 === 0;
  const Icon = event.icon;

  return (
    <div ref={ref} className={`relative flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'} mb-16`}>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="flex-1"
      >
        <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0a18] hover:border-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{event.year}</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">{event.title}</h3>
          <p className="text-indigo-400 text-sm mb-3">{event.org}</p>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{event.desc}</p>
          <div className="flex flex-wrap gap-2">
            {event.tags.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Center dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center z-10`}
        style={{ boxShadow: `0 0 30px ${event.glow}` }}
      >
        <Icon size={22} className="text-white" />
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
}

export default function TimelineSection() {
  return (
    <section id="experience" className="py-32 bg-[#030712] relative overflow-hidden">
      <div className="absolute left-1/2 top-32 bottom-32 w-px bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent -translate-x-1/2 hidden md:block" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.3em]">Journey</span>
          <h2 className="text-5xl font-black text-white mt-3">
            Experience{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Timeline
            </span>
          </h2>
        </motion.div>

        <div className="hidden md:block">
          {EVENTS.map((e, i) => <TimelineItem key={i} event={e} idx={i} />)}
        </div>

        {/* Mobile linear */}
        <div className="md:hidden space-y-6">
          {EVENTS.map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${e.color} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1 pb-6 border-b border-white/5">
                  <div className="text-indigo-400 text-xs font-bold mb-1">{e.year}</div>
                  <div className="text-white font-bold mb-1">{e.title}</div>
                  <div className="text-gray-500 text-sm">{e.org}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
