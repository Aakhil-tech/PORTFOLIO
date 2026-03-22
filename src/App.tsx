/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, useScroll, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Instagram, Mail, ArrowUpRight, ExternalLink } from 'lucide-react';

// --- Components ---

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 5}px, ${e.clientY - 5}px, 0)`;
      }
    };

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.15;
      ring.current.y += (pos.current.y - ring.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x - 18}px, ${ring.current.y - 18}px, 0)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    const handleHover = () => setIsHovering(true);
    const handleUnhover = () => setIsHovering(false);

    window.addEventListener('mousemove', moveCursor);
    raf.current = requestAnimationFrame(animate);
    
    const interactives = document.querySelectorAll('a, button, [role="button"], .project-card');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', handleHover);
      el.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cancelAnimationFrame(raf.current);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleHover);
        el.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef} 
        className="fixed top-0 left-0 w-[10px] h-[10px] bg-accent rounded-full pointer-events-none z-[10001]" 
      />
      <div 
        ref={ringRef} 
        className={`fixed top-0 left-0 w-[36px] h-[36px] border border-accent rounded-full pointer-events-none z-[10000] transition-all duration-300 ease-out ${isHovering ? 'scale-150 bg-accent/10' : 'scale-100'}`} 
      />
    </>
  );
};

const ThreeHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 16;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x39FF14,
      transparent: true,
      opacity: 0.5
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Holographic Cards
    const cards: THREE.Mesh[] = [];
    const cardGeo = new THREE.PlaneGeometry(1.5, 2);
    const cardMatBase = new THREE.MeshBasicMaterial({
      color: 0x39FF14,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.08,
      wireframe: true
    });

    for(let i=0; i<6; i++) {
      const card = new THREE.Mesh(cardGeo, cardMatBase.clone());
      card.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6
      );
      card.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(card);
      cards.push(card);
    }

    camera.position.z = 5;

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      particlesMesh.rotation.y = elapsedTime * 0.04;
      particlesMesh.position.x += (mouseX - particlesMesh.position.x) * 0.04;
      particlesMesh.position.y += (-mouseY - particlesMesh.position.y) * 0.04;

      cards.forEach((card, i) => {
        card.rotation.y += 0.008;
        card.rotation.x += 0.004;
        card.position.y += Math.sin(elapsedTime + i * 1.2) * 0.0015;
      });

      camera.position.x += (mouseX - camera.position.x) * 0.04;
      camera.position.y += (-mouseY - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

const BentoBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.IcosahedronGeometry(15, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x39FF14,
      wireframe: true,
      transparent: true,
      opacity: 0.03
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 20;

    const animate = () => {
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
};

const TimelineNode = ({ date, label, isOngoing, index }: { date: string, label: string, isOngoing?: boolean, index: number, key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col items-center relative min-w-[140px]"
  >
    <div className="font-mono text-[9px] text-accent tracking-[0.2em] uppercase mb-4">{date}</div>
    
    <div className="relative flex items-center justify-center w-8 h-8">
      {isOngoing ? (
        <div className="w-3.5 h-3.5 rounded-full border border-accent/40 animate-ping" />
      ) : (
        <>
          <div className="absolute w-3.5 h-3.5 rounded-full bg-accent/30 animate-ping" />
          <div className="w-3.5 h-3.5 rounded-full bg-accent z-10" />
        </>
      )}
    </div>

    <div className="font-mono text-[9px] text-muted tracking-wider uppercase text-center mt-4 max-w-[100px] leading-tight">
      {label}
    </div>
  </motion.div>
);

const ProjectCard = ({ title, subtitle, tags, description, features, linkedinUrl, index }: { 
  title: string, 
  subtitle: string,
  tags: string[], 
  description: string, 
  features: string[],
  linkedinUrl: string,
  index: number,
  key?: React.Key
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / (rect.height / 16); // ±8deg
    const rotateY = (centerX - x) / (rect.width / 16); // ±8deg
    
    const magX = (x - centerX) / (rect.width / 12); // ±6px
    const magY = (y - centerY) / (rect.height / 12); // ±6px

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${magX}px, ${magY}px, 0)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.2, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="bg-[#0b0b0b] border border-[rgba(57,255,20,0.15)] p-8 rounded-[20px] relative overflow-hidden flex flex-col transition-all duration-500 hover:border-[rgba(57,255,20,0.4)] hover:shadow-[0_0_50px_rgba(57,255,20,0.07)] backdrop-blur-[14px] h-[420px] group"
    >
      {/* Corner Accents */}
      <div className={`absolute top-0 right-0 w-8 h-8 border-t-[0.5px] border-r-[0.5px] border-accent transition-opacity duration-500 rounded-tr-[20px] ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-[0.5px] border-l-[0.5px] border-accent/40 transition-opacity duration-500 rounded-bl-[20px] ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="font-mono text-[9px] text-accent border-[0.5px] border-accent/20 px-[10px] py-[3px] rounded-full bg-accent/5 uppercase tracking-widest whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-[28px] font-[800] uppercase mb-1 tracking-tight group-hover:text-accent transition-colors duration-300 leading-tight font-display">{title}</h3>
        <div className="font-mono text-[10px] text-accent/60 uppercase tracking-widest mb-4">{subtitle}</div>
        
        <p className="text-[#666] text-[14px] leading-relaxed mb-6 flex-1 line-clamp-4">{description}</p>
        
        <div className="h-px w-full bg-accent/10 mb-6" />
        
        <ul className="space-y-2 mb-8">
          {features.map((f, i) => (
            <li key={i} className="font-mono text-[9px] text-[#555] flex items-start gap-2">
              <span className="text-accent">•</span>
              <span className="tracking-wider">{f}</span>
            </li>
          ))}
        </ul>
        
        <a 
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto flex items-center gap-2 font-mono text-[9px] text-accent uppercase tracking-widest transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <span>View on LinkedIn</span>
          <ArrowUpRight size={11} />
        </a>
      </div>
    </motion.div>
  );
};

const SignalMark = () => (
  <div className="relative w-[280px] h-[280px] flex items-center justify-center">
    {[1, 2, 3].map(i => (
      <div 
        key={i} 
        className="absolute rounded-full border border-accent/20"
        style={{ 
          width: `${i * 90}px`, 
          height: `${i * 90}px`, 
          animation: `pulse-ring ${1.5 + i * 0.5}s ease-out infinite`, 
          animationDelay: `${i * 0.3}s` 
        }} 
      />
    ))}
    <div className="absolute w-[200px] h-[200px] border border-accent/30 rounded-full animate-[spin_8s_linear_infinite]" />
    <div className="absolute w-[160px] h-[160px] border border-accent/20 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
    <motion.svg
      width="80" height="80" viewBox="0 0 80 80"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.2, 1, 0.3, 1] }}
      className="relative z-10"
    >
      <polyline points="15,55 15,20 55,20" fill="none" stroke="#39FF14" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="20" x2="65" y2="65" stroke="#39FF14" strokeWidth="5" strokeLinecap="round" />
      <polyline points="45,65 65,65 65,45" fill="none" stroke="#39FF14" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  </div>
);

const StatCard = ({ value, label }: { value: string, label: string }) => (
  <div className="bg-surface border border-accent/10 rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300">
    <div className="text-4xl font-extrabold text-accent mb-1 tracking-tighter">{value}</div>
    <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
  </div>
);

const SkillTag = ({ label, delay }: { label: string, delay: number, key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="flex items-center gap-4 py-3 border-l-2 border-accent pl-5 hover:bg-accent/5 transition-colors duration-300 group cursor-default"
  >
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted group-hover:text-accent transition-colors duration-300">{label}</span>
  </motion.div>
);

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[500] flex justify-between items-center px-10 py-6 transition-all duration-500 ${scrolled ? 'bg-bg/80 backdrop-blur-xl border-b border-accent/10 py-4' : ''}`}>
      <span className="font-mono text-accent text-xs tracking-[0.3em] uppercase">// AAKHIL</span>
      <ul className="flex gap-10">
        {['work', 'about', 'contact'].map((item) => (
          <li key={item}>
            <a href={`#${item}`} className="font-mono text-[10px] text-muted hover:text-accent transition-colors duration-300 uppercase tracking-widest">{item}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default function App() {
  const [glitch, setGlitch] = useState(false);
  const [burst, setBurst] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      if (window.scrollY > heroHeight * 0.45 && window.scrollY < heroHeight * 0.6) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 300);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('mohammedaakhil2k6@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const projects = [
    {
      title: 'JARVIS',
      subtitle: 'Local-First Personal AI Assistant',
      tags: ['Python', 'Ollama', 'Llama 3.2', 'MediaPipe', 'OpenCV', 'pyttsx3'],
      description: 'Privacy-first desktop assistant that sees your gestures, recognizes your face, speaks naturally, and thinks with Llama 3.2 — entirely offline. Teach it any gesture, give it any command.',
      features: [
        'Teachable gesture → command mapping',
        'Offline LLM reasoning via Ollama',
        'Face-locked security + voice countdowns'
      ],
      linkedinUrl: 'https://www.linkedin.com/posts/mohammed-aakhil_ai-personalassistant-localllm-ugcPost-7433414004242534400-MOz_?utm_source=share&utm_medium=member_desktop&rcm=ACoAAF3eABsBl8o3NtRIoH_H8H_9fV_bya7f2FQ',
    },
    {
      title: 'JARVIS Brain',
      subtitle: 'From Rigid Rules → Real Intelligence',
      tags: ['Python', 'Ollama', 'API Design', 'System Design'],
      description: 'Replaced hardcoded if-else logic with an API-driven intelligence layer. No scripted responses — handles messy natural input, generates answers probabilistically. The shift from automation to learning-oriented companion.',
      features: [
        'API-driven intelligence layer',
        'Probabilistic answer generation',
        'Orbital loading UI (Avengers: Age of Ultron inspired)'
      ],
      linkedinUrl: 'https://www.linkedin.com/posts/mohammed-aakhil_i-finally-moved-my-system-away-from-rigid-ugcPost-7420161722021425152-0jkF?utm_source=share&utm_medium=member_desktop&rcm=ACoAAF3eABsBl8o3NtRIoH_H8H_9fV_bya7f2FQ',
    },
    {
      title: 'JARVIS Eyes',
      subtitle: 'Computer Vision Module',
      tags: ['Python', 'TensorFlow', 'MediaPipe', 'OpenCV', 'Keras', 'Roboflow'],
      description: 'Standalone vision prototype that gives JARVIS eyes through the webcam. Real-time rock-paper-scissors classifier trained on 500+ hand-annotated images — the foundation for full visual intelligence.',
      features: [
        'Real-time hand gesture classification',
        'Custom CNN trained on 500+ annotated images',
        'Built to plug directly into main JARVIS system'
      ],
      linkedinUrl: 'https://www.linkedin.com/posts/mohammed-aakhil_as-part-of-my-ongoing-project-to-build-my-activity-7390598540420468736-LuY4?utm_source=share&utm_medium=member_desktop&rcm=ACoAAF3eABsBl8o3NtRIoH_H8H_9fV_bya7f2FQ',
    },
  ];

  const timeline = [
    { date: 'Jul 2025', label: 'JARVIS Eyes Born' },
    { date: 'Sep 2025', label: 'Brain Upgrade' },
    { date: 'Oct 2025', label: 'Gesture Teaching' },
    { date: 'Nov 2025', label: 'Llama 3.2 Integrated' },
    { date: '2026', label: 'Always Evolving', isOngoing: true },
  ];

  const skills = [
    'Python — Core Language',
    'Computer Vision (OpenCV, MediaPipe)',
    'Machine Learning (TensorFlow, Keras)',
    'Local LLMs (Ollama, Llama 3.2)',
    'React / Next.js / TypeScript',
    'React Native & Flutter',
    'Node.js & REST APIs',
    'Three.js & WebGL',
  ];

  return (
    <div className="relative min-h-screen bg-bg text-text selection:bg-accent selection:text-bg">
      <CustomCursor />
      <Nav />
      
      <div className={`fixed inset-0 z-[10002] pointer-events-none bg-accent mix-blend-difference opacity-0 ${glitch ? 'glitch-flash' : ''}`} />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] border-2 border-accent rounded-full pointer-events-none z-[10003] opacity-0 ${burst ? 'signal-burst' : ''}`} />
      
      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-accent text-bg font-mono text-[10px] px-6 py-2.5 tracking-[0.2em] uppercase z-[10004]"
          >
            EMAIL COPIED ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="scanline" />
        <ThreeHero />
        <div className="relative z-10 text-center px-6 max-w-[960px]">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-accent text-[11px] tracking-[0.35em] uppercase mb-6"
          >
            // PYTHON & AI DEVELOPER<span className="animate-pulse ml-1">_</span>
          </motion.p>
          <h1 className="text-[clamp(52px,10vw,118px)] font-extrabold leading-[0.88] uppercase tracking-tighter mb-8">
            {['TURNING', 'IDEAS INTO', 'PRODUCTS.'].map((line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.div
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className={i === 1 ? 'text-accent' : ''}
                >
                  {line}
                </motion.div>
              </div>
            ))}
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="font-mono text-muted text-sm mb-12 tracking-wide"
          >
            // Self-taught · Mobile · Web · AI Systems
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex gap-5 justify-center flex-wrap"
          >
            <a href="#work" className="px-9 py-4 bg-accent text-bg font-mono text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-accent border border-accent transition-all duration-300">View My Work</a>
            <a href="#contact" className="px-9 py-4 border border-accent/40 text-muted font-mono text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all duration-300">Get In Touch</a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 w-full bg-surface/50 backdrop-blur-md border-t border-accent/10 py-4 z-20 overflow-hidden">
          <div className="flex whitespace-nowrap ticker-animation">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                {['AVAILABLE FOR PROJECTS', 'PYTHON', 'AI / ML', 'COMPUTER VISION', 'REACT NATIVE', 'NEXT.JS', 'THREE.JS', 'OLLAMA', 'OPEN SOURCE'].map((item, j) => (
                  <div key={j} className="font-mono text-[9px] text-muted px-10 uppercase tracking-widest flex items-center whitespace-nowrap">
                    <span className="text-accent mr-3">//</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <motion.section 
        id="work" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative py-36 px-8 overflow-hidden"
      >
        <BentoBackground />
        <div className="max-w-[1380px] mx-auto relative z-10">
          <div className="mb-20">
            <span className="font-mono text-accent text-[10px] tracking-[0.35em] mb-4 block uppercase">// 002 — SELECTED WORK</span>
            <h2 className="text-[clamp(40px,6vw,80px)] font-extrabold uppercase tracking-tighter leading-none font-display">THE ARCHIVE</h2>
          </div>

          {/* Timeline */}
          <div className="mb-24 overflow-x-auto pb-8 scrollbar-hide">
            <div className="flex items-center justify-between min-w-[800px] px-10 relative">
              {/* Connecting Line */}
              <div className="absolute top-[52px] left-[60px] right-[60px] h-[1px] bg-gradient-to-r from-accent via-accent/30 to-accent/10 z-0" style={{ backgroundImage: 'linear-gradient(90deg, #39FF14, rgba(57,255,20,0.1))' }} />
              
              {timeline.map((node, i) => (
                <TimelineNode key={i} {...node} index={i} />
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={i} {...p} index={i} />
            ))}
          </div>

          <div className="mt-24 pt-10 border-t border-accent/8 flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
            {['Python', 'OpenCV', 'MediaPipe', 'TensorFlow', 'Ollama', 'React', 'Next.js', 'Three.js', 'Flutter', 'Node.js'].map((t, i, arr) => (
              <React.Fragment key={i}>
                <span className="font-mono text-muted text-[10px] tracking-widest uppercase hover:text-accent transition-colors duration-300 cursor-default">{t}</span>
                {i < arr.length - 1 && <div className="w-1 h-1 bg-accent rounded-full opacity-30" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About */}
      <section id="about" className="py-36 px-8 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #39FF14 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-[1380px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-20 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-mono text-accent text-[10px] tracking-[0.35em] mb-6 block uppercase">// 003 — IDENTITY</span>
              <h2 className="text-[clamp(36px,5vw,68px)] font-extrabold uppercase tracking-tighter leading-[0.92] mb-8">
                I DON'T JUST<br />WRITE CODE.<br /><span className="text-accent">I BUILD</span><br />INTELLIGENCE.
              </h2>
              <p className="text-muted text-base leading-relaxed mb-10 max-w-[520px]">
                Self-taught Python & AI developer with a deep obsession for computer vision and offline-first intelligent systems. I build tools that actually work — no subscriptions, no cloud lock-in, no compromise on performance. Every project starts with a problem and ends with something real.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <StatCard value="2+" label="AI Systems Built" />
                <StatCard value="500+" label="Images Annotated" />
                <StatCard value="100%" label="Offline — No Cloud" />
                <StatCard value="∞" label="Curiosity" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <SignalMark />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-24">
            {skills.map((s, i) => <SkillTag key={i} label={s} delay={i * 0.06} />)}
          </div>

          <div className="relative">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-10" />
            <div className="flex justify-between items-start gap-4 flex-wrap">
              {[
                { year: '2022', label: 'Started Coding' },
                { year: '2023', label: 'First Python Project' },
                { year: '2025', label: 'SOS (Computer Vision)' },
                { year: '2025', label: 'JARVIS Born' },
                { year: '2026', label: 'Open for Work' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-accent z-10 relative" />
                    <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                  </div>
                  <div className="font-mono text-[9px] text-accent tracking-widest uppercase">{item.year}</div>
                  <div className="font-mono text-[9px] text-muted tracking-wider uppercase text-center">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <motion.section 
        id="contact" 
        onViewportEnter={() => setBurst(true)}
        className="py-48 px-8 relative overflow-hidden text-center min-h-screen flex flex-col justify-center"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-accent opacity-[0.04] z-0 [clip-path:polygon(50%_0%,100%_38%,82%_100%,18%_100%,0%_38%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent opacity-[0.06] rounded-full z-0" />
        
        <div className="relative z-10 max-w-[800px] mx-auto">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-mono text-accent text-[10px] tracking-[0.35em] mb-8 block uppercase"
          >
            // 004 — SIGNAL
          </motion.span>
          <h2 className="text-[clamp(64px,16vw,180px)] font-extrabold leading-[0.8] uppercase tracking-tighter mb-10">
            LET'S<br /><span className="text-accent">BUILD.</span>
          </h2>
          <p className="font-mono text-muted text-sm mb-14 tracking-wide">// Open for freelance, contracts & collabs</p>
          
          <button 
            onClick={copyEmail}
            className="font-mono text-xl text-accent mb-16 relative group block mx-auto hover:text-text transition-colors duration-300"
          >
            mohammedaakhil2k6@gmail.com
            <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
            <span className="font-mono text-[9px] text-muted block mt-2 tracking-widest uppercase group-hover:text-accent/60 transition-colors">click to copy</span>
          </button>

          <div className="flex justify-center gap-10 mb-20">
            {[
              { label: 'GitHub', href: 'https://github.com/Aakhil-tech', icon: Github },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammed-aakhil', icon: Linkedin },
              { label: 'Instagram', href: 'https://instagram.com/mhd_aakhil_', icon: Instagram },
            ].map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent transition-colors duration-300 relative group">
                <Icon size={14} />
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          
          <div className="font-mono text-[9px] text-muted uppercase tracking-[0.2em]">© 2026 Aakhil — Crafted with obsession</div>
        </div>
      </motion.section>
    </div>
  );
}
