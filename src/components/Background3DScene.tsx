import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingDustField({ count = 120, reducedMotion }: { count?: number; reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random 3D points
  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
      sc[i] = Math.random() * 0.8 + 0.3;
    }
    return [pos, sc];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = clock.getElapsedTime() * 0.08;
    pointsRef.current.rotation.y = t * 0.25;
    pointsRef.current.rotation.x = Math.sin(t * 0.4) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          args={[scales, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#C8A96B"
        transparent
        opacity={0.38}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function AmbientPrisms({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime() * 0.15;
    groupRef.current.rotation.y = t * 0.2;
    groupRef.current.rotation.z = Math.cos(t * 0.3) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-6, 4, -8]} rotation={[0.4, 0.6, 0]}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#221b14"
          emissive="#C8A96B"
          emissiveIntensity={0.06}
          roughness={0.2}
          metalness={0.8}
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>
      <mesh position={[7, -5, -6]} rotation={[0.8, -0.4, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#1e1420"
          emissive="#E8D5A5"
          emissiveIntensity={0.05}
          roughness={0.2}
          metalness={0.8}
          wireframe
          transparent
          opacity={0.14}
        />
      </mesh>
    </group>
  );
}

export default function Background3DScene() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateViewport = () => setIsMobile(window.innerWidth <= 768);
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);

    window.addEventListener('resize', updateViewport);
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => {
      window.removeEventListener('resize', updateViewport);
      motionPreference.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 2]}
        fallback={null}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 10, 5]} intensity={0.4} color="#C8A96B" />
        <FloatingDustField count={isMobile ? 42 : 100} reducedMotion={reducedMotion} />
        <AmbientPrisms reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
