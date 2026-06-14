import type { Metadata } from 'next';
import PortfolioNav from '@/components/portfolio/PortfolioNav';
import HeroSection from '@/components/portfolio/HeroSection';
import AboutSection from '@/components/portfolio/AboutSection';
import ProjectsSection from '@/components/portfolio/ProjectsSection';
import SkillsSection from '@/components/portfolio/SkillsSection';
import TimelineSection from '@/components/portfolio/TimelineSection';
import ContactSection from '@/components/portfolio/ContactSection';

export const metadata: Metadata = {
  title: 'Likhith Dude — Cloud & AI/ML Engineer',
  description: 'M.S. CS at FAU. Building AI products: MLOps, Cloud Infrastructure, Full-Stack. F1: 98.49% fraud detection, F1: 100% cloud cost optimization.',
};

export default function PortfolioPage() {
  return (
    <main className="bg-[#030712] min-h-screen">
      <PortfolioNav />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <TimelineSection />
      <ContactSection />

      {/* Footer */}
      <footer className="py-10 text-center border-t border-white/5">
        <p className="text-gray-600 text-sm">
          Built with Next.js · Three.js · Framer Motion ·{' '}
          <span className="text-indigo-500">Powered by HireReady AI</span>
        </p>
        <p className="text-gray-700 text-xs mt-1">© 2025 Likhith Dude. All rights reserved.</p>
      </footer>
    </main>
  );
}
