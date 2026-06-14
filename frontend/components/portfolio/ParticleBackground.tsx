'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 80;

    // Particles
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#6366f1'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#3b82f6'),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Floating geometric shapes
    const shapes: THREE.Mesh[] = [];
    const geos = [
      new THREE.OctahedronGeometry(3),
      new THREE.TetrahedronGeometry(2.5),
      new THREE.IcosahedronGeometry(2),
      new THREE.TorusGeometry(2, 0.6, 8, 20),
    ];
    const shapePositions = [
      [-35, 15, -20], [38, -18, -15], [-28, -22, -10],
      [30, 25, -25], [-15, 30, -30], [20, -30, -20],
    ];
    shapePositions.forEach((pos, i) => {
      const g = geos[i % geos.length];
      const m = new THREE.MeshPhongMaterial({
        color: palette[i % palette.length],
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(pos[0], pos[1], pos[2]);
      scene.add(mesh);
      shapes.push(mesh);
    });

    // Lighting
    scene.add(new THREE.AmbientLight(0x6366f1, 0.5));
    const point = new THREE.PointLight(0x8b5cf6, 2, 200);
    point.position.set(50, 50, 50);
    scene.add(point);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize
    const onResize = () => {
      const w2 = mount.clientWidth;
      const h2 = mount.clientHeight;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let frame = 0;
    const animate = () => {
      const id = requestAnimationFrame(animate);
      (animate as any)._id = id;
      frame += 0.005;

      particles.rotation.y = frame * 0.05 + mouseX;
      particles.rotation.x = mouseY * 0.3;

      shapes.forEach((s, i) => {
        s.rotation.x += 0.005 + i * 0.001;
        s.rotation.y += 0.008 + i * 0.001;
        s.position.y += Math.sin(frame + i) * 0.02;
      });

      camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame((animate as any)._id);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
