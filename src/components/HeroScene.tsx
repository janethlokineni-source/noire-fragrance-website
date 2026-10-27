import { Suspense, useRef, useState, useEffect, useCallback, type MouseEvent, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { SlidersHorizontal, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import PerfumeBottle from './PerfumeBottle';
import HeroFilmLayer from './HeroFilmLayer';
import './HeroScene.css';

interface HeroSceneProps {
  onExploreClick: () => void;
  onDiscoverClick: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'mist' | 'sparkle' | 'droplet';
}

const GLASS_TINTS = [
  { label: 'Clear crystal', value: '#ded6c5' },
  { label: 'Smoked glass', value: '#55483e' },
  { label: 'Rose glass', value: '#9a5969' },
];

const LIQUID_TINTS = [
  { label: 'Oud amber', value: '#8B4513' },
  { label: 'Rose', value: '#c0607a' },
  { label: 'Golden amber', value: '#D4A017' },
  { label: 'Aquatic', value: '#4fc3f7' },
];

const CAP_FINISHES = [
  { label: 'Gold', value: '#C8A96B' },
  { label: 'Silver', value: '#B8C4CC' },
  { label: 'Rose gold', value: '#bd806f' },
];

const LIGHTING_MOODS = [
  { label: 'Sunset Gold', value: '#FFF0D0' },
  { label: 'Midnight Blue', value: '#91aee8' },
  { label: 'Emerald Elegance', value: '#83c7a2' },
];

function ScrollCameraMotion() {
  const { camera } = useThree();

  useFrame(() => {
    const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 0.85, 1), 1);
    camera.position.z += (9 - progress * 1.1 - camera.position.z) * 0.04;
    camera.position.y += (progress * 0.18 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function HeroScene({ onExploreClick, onDiscoverClick }: HeroSceneProps) {
  // Cursor tracking with smoothed values
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothedMouse, setSmoothedMouse] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  // Spray and cap interaction state
  const [isOpen, setIsOpen] = useState(false);
  const [isSpraying, setIsSpraying] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [glassTint, setGlassTint] = useState(GLASS_TINTS[0].value);
  const [liquidTint, setLiquidTint] = useState(LIQUID_TINTS[0].value);
  const [capFinish, setCapFinish] = useState(CAP_FINISHES[0].value);
  const [lightingMood, setLightingMood] = useState(LIGHTING_MOODS[0].value);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Smooth lerp for mouse motion
  useEffect(() => {
    let active = true;
    const lerp = () => {
      if (!active) return;
      setSmoothedMouse((prev) => {
        const factor = 0.08;
        return {
          x: prev.x + (mousePos.x - prev.x) * factor,
          y: prev.y + (mousePos.y - prev.y) * factor,
        };
      });
      requestAnimationFrame(lerp);
    };
    const req = requestAnimationFrame(lerp);
    return () => {
      active = false;
      cancelAnimationFrame(req);
    };
  }, [mousePos]);

  // Track mouse coordinates across hero section
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // Web Audio API: Realistic luxury perfume spray sound synthesis
  const playSpraySound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Mechanical actuator click transient
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(3200, now);
      clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.05);

      // 2. High-pressure atomized mist hiss (filtered noise)
      const bufferSize = ctx.sampleRate * 0.45;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter for authentic aerosol hiss
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(3400, now);
      bandpass.frequency.exponentialRampToValueAtTime(2200, now + 0.35);
      bandpass.Q.setValueAtTime(1.8, now);

      // Highpass to eliminate low rumble
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(1400, now);

      // Volume envelope: fast rise, steady spray, gentle taper
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      whiteNoise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Particle Spray Burst
  const triggerSprayBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Origin: nozzle aperture on bottle
    const rect = canvas.getBoundingClientRect();
    const originX = rect.width * 0.46;
    const originY = rect.height * 0.24;

    const newParticles: Particle[] = [];
    const count = 180;

    for (let i = 0; i < count; i++) {
      // Cone angle pointing upward and left (towards text content)
      const angle = -Math.PI * 0.65 + (Math.random() - 0.5) * 0.75;
      const speed = 4 + Math.random() * 8.5;

      const isSparkle = Math.random() < 0.28;
      const isDroplet = !isSparkle && Math.random() < 0.35;

      newParticles.push({
        x: originX + (Math.random() - 0.5) * 8,
        y: originY + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isSparkle ? 2.5 + Math.random() * 2.5 : isDroplet ? 1.5 + Math.random() * 2 : 3 + Math.random() * 5,
        alpha: 1,
        maxAlpha: isSparkle ? 0.95 : isDroplet ? 0.8 : 0.45,
        life: 0,
        maxLife: 45 + Math.random() * 55,
        color: isSparkle
          ? '#FFF4D0'
          : isDroplet
          ? '#E8D5A5'
          : 'rgba(235, 215, 175, 0.5)',
        type: isSparkle ? 'sparkle' : isDroplet ? 'droplet' : 'mist',
      });
    }

    particlesRef.current.push(...newParticles);
  }, []);

  // Main spray click handler
  const handleBottleClick = useCallback(() => {
    // Open the cap if closed
    setIsOpen(true);
    setIsSpraying(true);
    setSprayCount((c) => c + 1);

    // Play spray audio
    playSpraySound();

    // Trigger visual particle explosion
    triggerSprayBurst();

    // Secondary burst for realism
    setTimeout(() => {
      triggerSprayBurst();
    }, 140);

    // Stop spraying animation after burst
    setTimeout(() => {
      setIsSpraying(false);
    }, 800);

    // Cap gently descends and closes after 2.8s
    setTimeout(() => {
      setIsOpen(false);
    }, 2800);
  }, [playSpraySound, triggerSprayBurst]);

  const interactiveBottle = (
    <PerfumeBottle
      mouseX={mousePos.x}
      mouseY={mousePos.y}
      bottleColor={glassTint}
      liquidColor={liquidTint}
      capColor={capFinish}
      scale={1.08}
      isCapOpen={isOpen}
      isSpraying={isSpraying}
      onClick={handleBottleClick}
    />
  );

  // Canvas particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let running = true;
    const animate = () => {
      if (!running) return;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Air drag & deceleration
        p.vx *= 0.955;
        p.vy *= 0.955;

        // Subtle gravity & updraft
        p.vy += 0.04;

        // Expansion of mist
        if (p.type === 'mist') {
          p.size += 0.18;
        }

        // Fade out
        const progress = p.life / p.maxLife;
        p.alpha = p.maxAlpha * (1 - progress);

        if (p.life >= p.maxLife || p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === 'sparkle') {
          // Draw sparkling 4-point star
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.25, p.y - s * 0.25);
          ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x + s * 0.25, p.y + s * 0.25);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s * 0.25, p.y + s * 0.25);
          ctx.lineTo(p.x - s, p.y);
          ctx.lineTo(p.x - s * 0.25, p.y - s * 0.25);
          ctx.closePath();
          ctx.fill();

          // Soft glow
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 8;
        } else if (p.type === 'droplet') {
          // Glowing liquid droplet
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft atomized mist cloud
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(240, 220, 180, 0.45)');
          grad.addColorStop(0.5, 'rgba(212, 175, 105, 0.2)');
          grad.addColorStop(1, 'rgba(212, 175, 105, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 3D rotation angles calculated from smoothed mouse position
  const tiltX = smoothedMouse.y * -14; // Pitch (deg)
  const tiltY = smoothedMouse.x * 18;  // Yaw (deg)
  const shiftX = smoothedMouse.x * 20; // Parallax translate (px)
  const shiftY = smoothedMouse.y * 15;

  return (
    <section
      id="home"
      className="hero-section"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
    >
      {/* Ambient Atmospheric Background */}
      <div className="hero-bg">
        <div className="hero-vignette" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-center" />

        {/* Ambient Floating Dust */}
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 43) % 100}%`,
                animationDelay: `${(i * 0.4) % 6}s`,
                animationDuration: `${5 + ((i * 0.7) % 5)}s`,
                width: `${1.5 + (i % 3)}px`,
                height: `${1.5 + (i % 3)}px`,
                opacity: 0.25 + ((i % 4) * 0.12),
              }}
            />
          ))}
        </div>
      </div>

      <div className="hero-film-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 38 }}
          dpr={window.innerWidth <= 768 ? [1, 1.25] : [1, 1.6]}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          fallback={null}
          onCreated={() => setWebglReady(true)}
        >
          <ScrollCameraMotion />
          <Environment resolution={64}>
            <Lightformer form="rect" intensity={3} position={[0, 4, -3]} scale={[5, 2, 1]} color="#FFF0D0" />
            <Lightformer form="rect" intensity={2} position={[-4, 0, 2]} scale={[1, 5, 1]} color="#E8D5A5" />
            <Lightformer form="rect" intensity={2} position={[4, 0, 1]} scale={[1, 5, 1]} color="#FFFFFF" />
          </Environment>
          <ambientLight intensity={0.9} />
          <spotLight position={[4, 6, 6]} intensity={70} angle={0.35} penumbra={0.8} color={lightingMood} />
          <pointLight position={[-4, 0, 4]} intensity={24} color={lightingMood} />
          {customizerOpen || isOpen ? (
            <group position={[window.innerWidth > 768 ? 1.6 : 0, 0, 0]}>
              {interactiveBottle}
            </group>
          ) : (
            <Suspense fallback={interactiveBottle}>
              <HeroFilmLayer
                mouseX={mousePos.x}
                mouseY={mousePos.y}
                onClick={handleBottleClick}
              />
            </Suspense>
          )}
        </Canvas>
      </div>
      <div className="hero-film-shade" aria-hidden="true" />

      {/* Left Column: Hero Text Content */}
      <div className="hero-content">
        <motion.div
          className="hero-label label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          The Art of Fragrance
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          MORE THAN<br />
          A FRAGRANCE.<br />
          <em className="hero-title-italic">IT'S AN IDENTITY.</em>
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
        >
          Discover extraordinary fragrances crafted to capture emotion,
          express individuality, and leave an unforgettable impression.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <button className="btn-primary" onClick={onExploreClick} id="hero-explore-btn">
            <span>EXPLORE THE COLLECTION</span>
          </button>
          <button className="btn-outline" onClick={onDiscoverClick} id="hero-discover-btn">
            DISCOVER OUR WORLD
          </button>
        </motion.div>

        {/* Interactive Spray Callout Button */}
        <motion.div
          className="hero-spray-trigger"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <button
            className={`btn-spray-test ${isSpraying ? 'spraying' : ''}`}
            onClick={handleBottleClick}
            id="hero-spray-action-btn"
          >
            <Sparkles className="spray-icon" size={16} />
            <span>{isSpraying ? 'SPRAYING ESSENCE...' : 'TEST SCENT — CLICK TO SPRAY'}</span>
            {sprayCount > 0 && <span className="spray-count-badge">×{sprayCount}</span>}
          </button>

          <button
            className="btn-sound-toggle"
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? 'Mute atomizer sound' : 'Enable atomizer sound'}
            aria-label="Toggle spray sound"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          className="hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="scroll-line" />
          <span>Scroll to explore collection</span>
        </motion.div>
      </div>

      {/* Right Column: Real Masterpiece Perfume Bottle */}
      <div className="hero-bottle-stage">
        {/* Particle Canvas for Dynamic Scent Atomization */}
        <canvas ref={canvasRef} className="hero-spray-canvas" />

        {/* Scent Shockwave Ripple */}
        <AnimatePresence>
          {isSpraying && (
            <>
              <motion.div
                className="scent-wave scent-wave-1"
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 2.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />
              <motion.div
                className="scent-wave scent-wave-2"
                initial={{ scale: 0.2, opacity: 0.7 }}
                animate={{ scale: 3.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.7, delay: 0.12, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Real Luxury Photorealistic Perfume Bottle with 3D Depth */}
        <div
          ref={bottleRef}
          className={`hero-bottle-wrapper ${isHovered ? 'hovered' : ''} ${isSpraying ? 'recoil' : ''}`}
          style={{
            transform: `perspective(1200px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) translate3d(${shiftX}px, ${shiftY}px, 20px)`,
            cursor: 'pointer',
            pointerEvents: webglReady ? 'none' : 'auto',
          }}
          onClick={() => { if (!webglReady) handleBottleClick(); }}
          title="Click to open cap and spray fragrance"
          id="hero-perfume-bottle-interactive"
        >
          {/* Pedestal Aura Glow */}
          <div
            className="bottle-pedestal-glow"
            style={{
              transform: `translate(${-shiftX * 0.6}px, ${-shiftY * 0.4}px)`,
            }}
          />

          {/* Base Bottle Body (Real Photograph of NOIRÉ OUD) */}
          <div className={`bottle-image-frame ${customizerOpen ? 'customizing' : 'cinematic'}`}>
            <img
              src="/bottle-noire-oud.jpg"
              alt="NOIRÉ OUD Ultra-Luxury Fragrance Flacon"
              className="bottle-real-img"
              draggable={false}
              style={{ opacity: webglReady ? 0 : 1 }}
            />

            {/* Specular Glint & Sheen that tracks cursor */}
            <div
              className="bottle-dynamic-glare"
              style={{
                background: `radial-gradient(circle 240px at ${50 + smoothedMouse.x * 35}% ${45 + smoothedMouse.y * 30}%, rgba(255, 235, 185, 0.42), rgba(255, 215, 120, 0.08) 50%, transparent 80%)`,
              }}
            />

            {/* Golden Atomizer Nozzle (Revealed when cap is open) */}
            {!webglReady && <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="golden-nozzle-revealed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="nozzle-stem" />
                  <div className="nozzle-head">
                    <div className={`nozzle-hole ${isSpraying ? 'active-spray' : ''}`} />
                  </div>
                  {/* Glowing mist plume emerging from hole */}
                  {isSpraying && <div className="nozzle-mist-jet" />}
                </motion.div>
              )}
            </AnimatePresence>}

            {/* Separable Real Gold Cap (Elevates and tilts when clicked) */}
            {!webglReady && <motion.div
              className="bottle-cap-layer"
              initial={false}
              animate={{
                y: isOpen ? -82 : 0,
                x: isOpen ? 12 : 0,
                rotate: isOpen ? -9 : 0,
                scale: isOpen ? 1.04 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 18,
                mass: 0.8,
              }}
            >
              <img
                src="/hero-cap.png"
                alt="NOIRÉ 24K Gold Cap"
                className="bottle-cap-img"
                draggable={false}
              />
              {/* Cap gold specular glint */}
              <div className="cap-gold-glint" />
            </motion.div>}
          </div>

          {/* Luxury Mirror Reflection Pool beneath bottle */}
          <div className="bottle-mirror-reflection" aria-hidden="true" />

          {/* Floating Interactive Callout Badge */}
          <div className="bottle-floating-badge">
            <span className="badge-pulse-dot" />
            <span className="badge-text">
              {isOpen ? '✦ ATOMIZER ACTIVE' : '✦ CLICK TO OPEN & SPRAY'}
            </span>
          </div>
        </div>

        <button
          className="customizer-toggle"
          onClick={() => setCustomizerOpen((open) => !open)}
          aria-expanded={customizerOpen}
          aria-controls="bottle-customizer"
          aria-label={customizerOpen ? 'Close bottle customizer' : 'Customize bottle'}
          title={customizerOpen ? 'Close bottle customizer' : 'Customize bottle'}
        >
          {customizerOpen ? <X size={17} /> : <SlidersHorizontal size={17} />}
        </button>

        <AnimatePresence>
          {customizerOpen && (
            <motion.aside
              id="bottle-customizer"
              className="customizer-panel"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.2 }}
              aria-label="Bottle customizer"
            >
              <p className="customizer-heading">GLASS TINT</p>
              <div className="customizer-options" role="group" aria-label="Glass tint">
                {GLASS_TINTS.map((tint) => (
                  <button
                    key={tint.value}
                    className="customizer-swatch"
                    style={{ '--swatch': tint.value } as React.CSSProperties}
                    onClick={() => setGlassTint(tint.value)}
                    aria-label={`Glass tint: ${tint.label}`}
                    aria-pressed={glassTint === tint.value}
                  />
                ))}
              </div>

              <p className="customizer-heading">FLUID COLOR</p>
              <div className="customizer-options" role="group" aria-label="Fluid color">
                {LIQUID_TINTS.map((tint) => (
                  <button
                    key={tint.value}
                    className="customizer-swatch"
                    style={{ '--swatch': tint.value } as React.CSSProperties}
                    onClick={() => setLiquidTint(tint.value)}
                    aria-label={`Fluid color: ${tint.label}`}
                    aria-pressed={liquidTint === tint.value}
                  />
                ))}
              </div>

              <p className="customizer-heading">CAP FINISH</p>
              <div className="customizer-options" role="group" aria-label="Cap finish">
                {CAP_FINISHES.map((finish) => (
                  <button
                    key={finish.value}
                    className="customizer-swatch"
                    style={{ '--swatch': finish.value } as React.CSSProperties}
                    onClick={() => setCapFinish(finish.value)}
                    aria-label={`Cap finish: ${finish.label}`}
                    aria-pressed={capFinish === finish.value}
                  />
                ))}
              </div>

              <p className="customizer-heading">LIGHTING MOOD</p>
              <div className="customizer-moods" role="group" aria-label="Lighting mood">
                {LIGHTING_MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    className="customizer-mood"
                    onClick={() => setLightingMood(mood.value)}
                    aria-pressed={lightingMood === mood.value}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Luxury Scent Notes Card (Appears after spraying) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fragrance-spray-card"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div className="spray-card-header">
                <Sparkles size={14} className="gold-icon" />
                <span className="spray-tag">SIGNATURE ATOMIZATION</span>
              </div>
              <h4 className="spray-name">NOIRÉ OUD</h4>
              <p className="spray-notes">
                <strong>Top:</strong> Cambodian Agarwood & Pink Peppercorn<br />
                <strong>Heart:</strong> Damascus Rose & Smoked Leather<br />
                <strong>Base:</strong> Bourbon Amber & Golden Patchouli
              </p>
              <div className="spray-footer">
                <span>Concentration: Extrait de Parfum (32%)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
