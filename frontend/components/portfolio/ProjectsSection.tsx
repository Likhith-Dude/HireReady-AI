'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, TrendingUp, Cpu, Briefcase, Shield } from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    icon: TrendingUp,
    name: 'MLOps Fraud Detection',
    tagline: 'Production-grade fraud detection pipeline',
    description: 'End-to-end MLOps pipeline with feature engineering, ensemble modeling, and real-time inference API. Achieved state-of-the-art fraud detection accuracy.',
    tech: ['Python', 'Scikit-Learn', 'XGBoost', 'FastAPI', 'Docker', 'MLflow', 'AWS'],
    color: 'from-indigo-600 to-purple-700',
    glowColor: 'rgba(99,102,241,0.5)',
    badge: null,
    metrics: [
      { label: 'F1 Score', value: '98.49%', color: 'text-green-400' },
      { label: 'Precision', value: '97.8%', color: 'text-indigo-400' },
      { label: 'Recall', value: '99.1%', color: 'text-purple-400' },
      { label: 'AUC-ROC', value: '0.997', color: 'text-cyan-400' },
    ],
    github: 'https://github.com/Likhith-Dude',
    category: 'AI / ML',
  },
  {
    id: 2,
    icon: Cpu,
    name: 'Cloud Cost Optimization',
    tagline: 'ML-powered AWS cost intelligence engine',
    description: 'Intelligent AWS cost analysis engine using machine learning to predict, detect anomalies, and recommend optimizations across all cloud resources.',
    tech: ['Python', 'AWS', 'Scikit-Learn', 'Pandas', 'Boto3', 'PostgreSQL', 'Grafana'],
    color: 'from-cyan-600 to-blue-700',
    glowColor: 'rgba(6,182,212,0.5)',
    badge: null,
    metrics: [
      { label: 'F1 Score', value: '100%', color: 'text-green-400' },
      { label: 'Cost Saved', value: '35%', color: 'text-cyan-400' },
      { label: 'Anomalies', value: 'Real-time', color: 'text-blue-400' },
      { label: 'Coverage', value: '15+ Services', color: 'text-indigo-400' },
    ],
    github: 'https://github.com/Likhith-Dude/Cloud-Cost-Optimization-Engine',
    category: 'Cloud / MLOps',
  },
  {
    id: 3,
    icon: Briefcase,
    name: 'HireReady AI',
    tagline: 'Full-stack AI job hunting platform',
    description: 'Production-grade AI-powered job hunting platform with 7-source job aggregation, resume parsing, ATS checking, interview prep, and real-time WebSockets.',
    tech: ['Next.js', 'FastAPI', 'Groq AI', 'SQLite', 'Three.js', 'WebSockets', 'Docker'],
    color: 'from-purple-600 to-pink-600',
    glowColor: 'rgba(139,92,246,0.5)',
    badge: null,
    metrics: [
      { label: 'Files Shipped', value: '56', color: 'text-purple-400' },
      { label: 'API Endpoints', value: '30+', color: 'text-pink-400' },
      { label: 'Job Sources', value: '7', color: 'text-indigo-400' },
      { label: 'Systems Built', value: '10', color: 'text-green-400' },
    ],
    github: 'https://github.com/Likhith-Dude/HireReady-AI',
    category: 'Full-Stack AI',
  },
  {
    id: 4,
    icon: Shield,
    name: 'Blockchain Event Spotting',
    tagline: 'ML cybersecurity with blockchain trust verification',
    description: 'ML-powered cybersecurity threat detection on 257,673 real UNSW-NB15 records with blockchain-based event verification and hybrid ECC+AES encryption.',
    tech: ['Python', 'Blockchain', 'ECC+AES', 'Random Forest', 'NLP', 'Scikit-learn'],
    color: 'from-emerald-600 to-teal-700',
    glowColor: 'rgba(16,185,129,0.5)',
    badge: 'PUBLISHED · ICCCAI-2024',
    metrics: [
      { label: 'Random Forest', value: '98.36%', color: 'text-green-400' },
      { label: 'Grad. Boosting', value: '96.55%', color: 'text-emerald-400' },
      { label: 'Decision Tree', value: '89.42%', color: 'text-teal-400' },
      { label: 'Published', value: 'ICCCAI-2024', color: 'text-yellow-400' },
    ],
    github: 'https://github.com/Likhith-Dude/Blockchain-Event-Spotting',
    category: 'Security / Research',
  },
];

function ProjectCard({ project, delay }: { project: typeof PROJECTS[0]; delay: number }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = project.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      /* Fixed height — every card is exactly 460px */
      className="cursor-pointer h-[460px]"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(f => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── FRONT ─────────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br ${project.color} p-6 flex flex-col transition-shadow duration-500`}
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: flipped ? 'none' : undefined,
          }}
        >
          {/* Row 1 — icon + category (fixed height) */}
          <div className="flex items-start justify-between mb-5 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Icon size={24} className="text-white" />
            </div>
            <div className="flex flex-col items-end gap-1.5 ml-2 min-w-0">
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 whitespace-nowrap">
                {project.category}
              </span>
              {project.badge && (
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest px-2.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 whitespace-nowrap">
                  {project.badge}
                </span>
              )}
            </div>
          </div>

          {/* Row 2 — title (fixed, 2 lines max) */}
          <h3 className="text-xl font-black text-white leading-tight mb-2 flex-shrink-0 line-clamp-2">
            {project.name}
          </h3>

          {/* Row 3 — tagline (1 line) */}
          <p className="text-white/60 text-xs font-medium mb-3 flex-shrink-0 line-clamp-1">
            {project.tagline}
          </p>

          {/* Row 4 — description (grows, clamped to 4 lines) */}
          <p className="text-white/45 text-xs leading-relaxed flex-1 line-clamp-4 overflow-hidden">
            {project.description}
          </p>

          {/* Row 5 — tech badges (pinned to bottom, fixed height) */}
          <div className="flex flex-wrap gap-1.5 mt-4 flex-shrink-0 min-h-[52px] content-start">
            {project.tech.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/70 h-6 flex items-center">
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/70 h-6 flex items-center">
                +{project.tech.length - 4}
              </span>
            )}
          </div>

          {/* Row 6 — hint (always at bottom, fixed) */}
          <p className="text-white/25 text-[10px] text-center mt-3 flex-shrink-0 tracking-widest uppercase">
            Hover to see metrics →
          </p>
        </div>

        {/* ── BACK ──────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-3xl border border-white/10 bg-[#0d0d1a] p-6 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Title */}
          <div className="flex-shrink-0 mb-1">
            <h3 className="text-lg font-black text-white leading-tight line-clamp-2">{project.name}</h3>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Live Metrics</p>
          </div>

          {/* Metrics grid — takes up all middle space */}
          <div className="grid grid-cols-2 gap-3 my-4 flex-1">
            {project.metrics.map(m => (
              <div key={m.label} className="rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center p-3">
                <div className={`text-xl font-black ${m.color} leading-none`}>{m.value}</div>
                <div className="text-gray-500 text-[10px] mt-1.5 text-center leading-tight">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tech tags — fixed height */}
          <div className="flex flex-wrap gap-1.5 flex-shrink-0 min-h-[44px] content-start mb-3">
            {project.tech.map(t => (
              <span key={t} className="text-[10px] px-2 py-1 rounded-full border border-indigo-500/30 text-indigo-400 h-6 flex items-center">
                {t}
              </span>
            ))}
          </div>

          {/* Buttons — always at bottom */}
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-white text-xs hover:bg-white/5 transition-colors"
            >
              <Github size={14} /> GitHub
            </a>
            <a
              href="#"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={14} /> Demo
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-32 bg-[#030712] relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.3em]">What I've Built</span>
          <h2 className="text-5xl font-black text-white mt-3">
            Featured{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-gray-500 mt-4">Hover the cards to reveal live metrics</p>
        </motion.div>

        {/* 1 col mobile → 2 col tablet → 4 col desktop, equal rows via fixed card height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}
