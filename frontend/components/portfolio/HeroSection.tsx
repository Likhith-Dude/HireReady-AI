'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(() => import('./ParticleBackground'), { ssr: false });

const TITLES = ['Cloud Engineer', 'AI/ML Engineer', 'MLOps Engineer', 'Entrepreneur'];

export default function HeroSection() {
  const [titleIdx, setTitleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTitleIdx(i => (i + 1) % TITLES.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]">
      <ParticleBackground />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Available for opportunities
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black text-white mb-4 leading-none tracking-tight"
          style={{ textShadow: '0 0 80px rgba(99,102,241,0.5), 0 0 160px rgba(139,92,246,0.3)' }}
        >
          Likhith
          <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Dude
          </span>
        </motion.h1>

        {/* Rotating title */}
        <div className="h-14 flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={titleIdx}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-light text-indigo-300"
            >
              {TITLES[titleIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-400 text-lg max-w-xl mx-auto mb-12"
        >
          M.S. Computer Science @ FAU · Building AI products that matter
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <a
            href="#projects"
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-105"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-full border border-indigo-500/50 text-indigo-300 font-semibold text-lg hover:bg-indigo-500/10 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-105"
          >
            Hire Me
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-gray-600 text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-indigo-500/40 flex items-start justify-center pt-1"
          >
            <div className="w-1 h-2 rounded-full bg-indigo-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
