'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const SKILL_CATEGORIES = {
  Cloud: { color: '#06b6d4', skills: ['AWS', 'EC2', 'S3', 'Lambda', 'RDS', 'CloudWatch', 'IAM', 'VPC'] },
  'AI/ML': { color: '#8b5cf6', skills: ['PyTorch', 'Scikit-Learn', 'XGBoost', 'MLflow', 'Pandas', 'NumPy', 'Transformers', 'LangChain'] },
  Backend: { color: '#6366f1', skills: ['FastAPI', 'Python', 'PostgreSQL', 'Redis', 'REST APIs', 'WebSockets', 'SQLAlchemy', 'Groq AI'] },
  DevOps: { color: '#10b981', skills: ['Docker', 'GitHub Actions', 'CI/CD', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Sentry'] },
};

function SkillGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
    camera.position.z = 120;

    // Globe wireframe
    const globeGeo = new THREE.SphereGeometry(40, 24, 24);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.08,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(38, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x312e81, transparent: true, opacity: 0.15,
    });
    scene.add(new THREE.Mesh(innerGeo, innerMat));

    // Skill dots on sphere surface
    const allSkills = Object.entries(SKILL_CATEGORIES).flatMap(([cat, { color, skills }]) =>
      skills.map(s => ({ name: s, color, cat }))
    );

    const dotGroup = new THREE.Group();
    allSkills.forEach((skill, i) => {
      const phi = Math.acos(-1 + (2 * i) / allSkills.length);
      const theta = Math.sqrt(allSkills.length * Math.PI) * phi;
      const r = 44;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const geo = new THREE.SphereGeometry(1.2, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(skill.color) });
      const dot = new THREE.Mesh(geo, mat);
      dot.position.set(x, y, z);
      dotGroup.add(dot);
    });
    scene.add(dotGroup);

    // Rings
    [-15, 0, 15].forEach((y, i) => {
      const ringGeo = new THREE.TorusGeometry(40 * Math.cos(y * 0.025), 0.3, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.15 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y * 2.5;
      scene.add(ring);
    });

    scene.add(new THREE.AmbientLight(0x6366f1, 1));

    let frame = 0;
    let mouseX = 0, mouseY = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const animate = () => {
      const id = requestAnimationFrame(animate);
      (animate as any)._id = id;
      frame += 0.005;
      globe.rotation.y = frame * 0.3 + mouseX * 0.5;
      globe.rotation.x = mouseY * 0.2;
      dotGroup.rotation.y = frame * 0.3 + mouseX * 0.5;
      dotGroup.rotation.x = mouseY * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame((animate as any)._id);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

export default function SkillsSection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="skills" className="py-32 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(139,92,246,0.08)_0%,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.3em]">Expertise</span>
          <h2 className="text-5xl font-black text-white mt-3">
            Skills{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Universe
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[420px] relative"
          >
            <SkillGlobe />
            <div className="absolute inset-0 pointer-events-none rounded-full"
              style={{ background: 'radial-gradient(circle, transparent 40%, #030712 80%)' }} />
          </motion.div>

          {/* Categories */}
          <div className="space-y-6">
            {Object.entries(SKILL_CATEGORIES).map(([cat, { color, skills }], i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border border-white/5 bg-white/2 hover:border-white/10 transition-all cursor-pointer group"
                onClick={() => setActive(active === cat ? null : cat)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                  <span className="text-white font-bold text-lg">{cat}</span>
                  <span className="ml-auto text-gray-600 text-xs">{skills.length} skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1.5 rounded-full border text-gray-300 transition-all"
                      style={{
                        borderColor: `${color}40`,
                        backgroundColor: `${color}10`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
