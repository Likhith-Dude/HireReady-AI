'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Timeline', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export default function PortfolioNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#030712]/80 backdrop-blur-xl border-b border-white/5' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="text-white font-black text-xl tracking-tight">
          LD<span className="text-indigo-400">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:dudelikhith@gmail.com"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all"
          >
            Hire Me
          </a>
          <a
            href="/"
            className="px-4 py-2 rounded-full border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all"
          >
            Job Search →
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
