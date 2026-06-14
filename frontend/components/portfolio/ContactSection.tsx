'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send, CheckCircle } from 'lucide-react';

const SOCIALS = [
  {
    icon: Github,
    label: 'GitHub',
    value: '@Likhith-Dude',
    href: 'https://github.com/Likhith-Dude',
    color: '#6366f1',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Likhith Dude',
    href: 'https://linkedin.com/in/likhith-dude',
    color: '#0ea5e9',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'dudelikhith@gmail.com',
    href: 'mailto:dudelikhith@gmail.com',
    color: '#8b5cf6',
  },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <section id="contact" className="py-32 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.1)_0%,transparent_70%)]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.3em]">Get In Touch</span>
          <h2 className="text-5xl font-black text-white mt-3">
            Let's{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto">
            I'm open to full-time roles, internships, and interesting projects. Let's build something great together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Availability badge */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-green-500/30 bg-green-500/5 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
                <span className="text-green-400 font-semibold text-sm">Available for opportunities</span>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed">
              Currently pursuing M.S. CS at FAU (graduating 2026). Looking for{' '}
              <span className="text-indigo-400">AI/ML Engineering</span>,{' '}
              <span className="text-purple-400">Cloud Engineering</span>, and{' '}
              <span className="text-cyan-400">MLOps</span> roles where I can build things that matter.
            </p>

            <div className="space-y-4 mt-8">
              {SOCIALS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 hover:border-white/10 transition-all group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${s.color}20`, border: `1px solid ${s.color}40` }}
                    >
                      <Icon size={20} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">{s.label}</div>
                      <div className="text-white font-medium text-sm">{s.value}</div>
                    </div>
                    <div className="ml-auto text-gray-700 group-hover:text-gray-400 transition-colors text-xs">↗</div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 rounded-3xl border border-green-500/20 bg-green-500/5"
              >
                <CheckCircle size={56} className="text-green-400 mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400">Thanks for reaching out. I'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Your Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    placeholder="Recruiter Smith"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    placeholder="recruiter@company.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                    placeholder="I'd love to discuss an opportunity at..."
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  {loading ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
