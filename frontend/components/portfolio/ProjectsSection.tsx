'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, TrendingUp, Cpu, Briefcase } from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    icon: TrendingUp,
    name: 'MLOps Fraud Detection',
    tagline: 'Production-grade fraud detection pipeline',
    description: 'End-to-end MLOps pipeline with feature engineering, ensemble modeling, and real-time inference API. Achieved state-of-the-art fraud detection accuracy.',
    tech: ['Python', 'Scikit-Learn', 'XGBoost', 'FastAPI', 'Docker', 'MLflow', 'AWS'],
    color: 'from-indigo-600 to-purple-700',
    glow: 'shadow-[0_0_60px_rgba(99,102,241,0.4)]',
    metrics: [
      { label: 'F1 Score', value: '98.49%', color: 'text-green-400' },
      { label: 'Precision', value: '97.8%', color: 'text-indigo-400' },
      { label: 'Recall', value: '99.1%', color: 'text-purple-400' },
      { label: 'AUC-ROC', value: '0.997', color: 'text-cyan-400' },
    ],
    github: 'https://github.com/Likhith-Dude',
    category: 'AI/ML',
  },
  {
    id: 2,
    icon: Cpu,
    name: 'Cloud Cost Optimization',
    tagline: 'ML-powered AWS cost intelligence engine',
    description: 'Intelligent AWS cost analysis engine using machine learning to predict, detect anomalies, and recommend optimizations across all cloud resources.',
    tech: ['Python', 'AWS', 'Scikit-Learn', 'Pandas', 'Boto3', 'PostgreSQL', 'Grafana'],
    color: 'from-cyan-600 to-blue-700',
    glow: 'shadow-[0_0_60px_rgba(6,182,212,0.4)]',
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
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.4)]',
    metrics: [
      { label: 'Files Shipped', value: '56', color: 'text-purple-400' },
      { label: 'API Endpoints', value: '30+', color: 'text-pink-400' },
      { label: 'Job Sources', value: '7', color: 'text-indigo-400' },
      { label: 'Systems Built', value: '10', color: 'text-green-400' },
    ],
    github: 'https://github.com/Likhith-Dude/HireReady-AI',
    category: 'Full-Stack AI',
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
      className="perspective-1000 h-[420px] cursor-pointer"
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
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br ${project.color} p-8 flex flex-col justify-between backface-hidden hover:${project.glow} transition-shadow duration-500`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Icon size={28} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                {project.category}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white mb-3">{project.name}</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">{project.tagline}</p>
            <p className="text-white/50 text-sm leading-relaxed">{project.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tech.slice(0, 4).map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">{t}</span>
            ))}
            {project.tech.length > 4 && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">+{project.tech.length - 4}</span>
            )}
          </div>
          <p className="text-white/30 text-xs mt-4 text-center">Hover to see metrics →</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-3xl border border-white/10 bg-[#0d0d1a] p-8 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <h3 className="text-xl font-black text-white mb-2">{project.name}</h3>
            <p className="text-gray-500 text-xs mb-8">Live Metrics</p>
            <div className="grid grid-cols-2 gap-4">
              {project.metrics.map(m => (
                <div key={m.label} className="p-4 rounded-2xl bg-white/3 border border-white/5 text-center">
                  <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tech.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded-full border border-indigo-500/30 text-indigo-400">{t}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white text-sm hover:bg-white/5 transition-colors"
              >
                <Github size={16} /> GitHub
              </a>
              <a
                href="#"
                onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={16} /> Demo
              </a>
            </div>
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

        <div className="grid md:grid-cols-3 gap-8">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}
