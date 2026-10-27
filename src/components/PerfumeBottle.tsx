import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================
// LUXURY PERFUME BOTTLE — Enhanced 3D procedural geometry
// ============================================================

interface PerfumeBottleProps {
  mouseX?: number;
  mouseY?: number;
  onClick?: () => void;
  bottleColor?: string;
  liquidColor?: string;
  capColor?: string;
  autoRotate?: boolean;
  scale?: number;
  isCapOpen?: boolean;
  isSpraying?: boolean;
}

function BottleBody({ liquidColor = '#8B4513', bottleColor = '#1a1a2e' }: { liquidColor?: string; bottleColor?: string }) {
  const liquidRef = useRef<THREE.Mesh>(null);

  // Animate liquid subtle shimmer
  useFrame(({ clock }) => {
    if (liquidRef.current) {
      const mat = liquidRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.08 + Math.sin(clock.getElapsedTime() * 1.4) * 0.04;
    }
  });

  const bottleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.78, -1.95);
    shape.quadraticCurveTo(-0.96, -1.95, -0.96, -1.72);
    shape.lineTo(-0.96, 0.34);
    shape.quadraticCurveTo(-0.96, 0.62, -0.74, 0.78);
    shape.lineTo(-0.38, 1.04);
    shape.quadraticCurveTo(-0.3, 1.1, -0.3, 1.24);
    shape.lineTo(-0.3, 1.86);
    shape.lineTo(0.3, 1.86);
    shape.lineTo(0.3, 1.24);
    shape.quadraticCurveTo(0.3, 1.1, 0.38, 1.04);
    shape.lineTo(0.74, 0.78);
    shape.quadraticCurveTo(0.96, 0.62, 0.96, 0.34);
    shape.lineTo(0.96, -1.72);
    shape.quadraticCurveTo(0.96, -1.95, 0.78, -1.95);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.07,
      bevelThickness: 0.07,
      curveSegments: 8,
    });
    geometry.translate(0, 0, -0.21);
    return geometry;
  }, []);

  const liquidGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.68, -1.82);
    shape.quadraticCurveTo(-0.84, -1.82, -0.84, -1.62);
    shape.lineTo(-0.84, 0.28);
    shape.quadraticCurveTo(-0.84, 0.48, -0.66, 0.61);
    shape.lineTo(-0.32, 0.84);
    shape.lineTo(0.32, 0.84);
    shape.lineTo(0.66, 0.61);
    shape.quadraticCurveTo(0.84, 0.48, 0.84, 0.28);
    shape.lineTo(0.84, -1.62);
    shape.quadraticCurveTo(0.84, -1.82, 0.68, -1.82);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 8,
    });
    geometry.translate(0, 0, -0.125);
    return geometry;
  }, []);

  return (
    <group>
      {/* Liquid inside */}
      <mesh geometry={liquidGeometry} ref={liquidRef}>
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.08}
          transparent
          opacity={0.82}
          roughness={0.0}
          metalness={0.0}
        />
      </mesh>

      {/* Glass bottle — high-quality transmission */}
      <mesh geometry={bottleGeometry}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.3}
          samples={12}
          thickness={0.4}
          roughness={0.01}
          transmission={0.98}
          ior={1.52}
          chromaticAberration={0.04}
          color={bottleColor}
          attenuationDistance={1.8}
          attenuationColor={bottleColor}
          temporalDistortion={0.02}
          distortionScale={0.04}
          reflectivity={0.6}
          anisotropy={0.3}
        />
      </mesh>
    </group>
  );
}

function BottleCap({
  capColor = '#C8A96B',
  isCapOpen = false,
  isSpraying = false,
}: {
  capColor?: string;
  isCapOpen?: boolean;
  isSpraying?: boolean;
}) {
  const capGroupRef = useRef<THREE.Group>(null);
  const capGeometry = useMemo(() => new THREE.CylinderGeometry(0.56, 0.56, 0.38, 48), []);
  const capTopGeometry = useMemo(() => new THREE.CylinderGeometry(0.54, 0.54, 0.025, 48), []);
  const capRimGeometry = useMemo(() => new THREE.TorusGeometry(0.54, 0.018, 12, 48), []);
  const neckGeometry = useMemo(() => new THREE.CylinderGeometry(0.13, 0.23, 0.28, 32), []);
  const nozzleGeometry = useMemo(() => new THREE.CylinderGeometry(0.06, 0.08, 0.35, 24), []);
  const nozzleHole = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.05, 16), []);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(0.245, 0.018, 16, 60), []);

  useFrame(() => {
    if (!capGroupRef.current) return;
    const targetY = isCapOpen ? 1.05 : 0;
    const targetRotZ = isCapOpen ? -0.15 : 0;
    const targetRotX = isCapOpen ? 0.08 : 0;
    capGroupRef.current.position.y = THREE.MathUtils.lerp(capGroupRef.current.position.y, targetY, 0.08);
    capGroupRef.current.rotation.z = THREE.MathUtils.lerp(capGroupRef.current.rotation.z, targetRotZ, 0.08);
    capGroupRef.current.rotation.x = THREE.MathUtils.lerp(capGroupRef.current.rotation.x, targetRotX, 0.08);
  });

  return (
    <group position={[0, 2.32, 0]}>
      {/* Permanent neck mounted on bottle */}
      <mesh geometry={neckGeometry} position={[0, -0.45, 0]}>
        <meshStandardMaterial color={capColor} metalness={0.98} roughness={0.04} />
      </mesh>
      {/* Decorative ring */}
      <mesh geometry={ringGeometry} position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={capColor} metalness={0.98} roughness={0.02} />
      </mesh>

      {/* Internal Atomizer Nozzle Stem & Head */}
      <group position={[0, -0.18, 0]}>
        <mesh geometry={nozzleGeometry}>
          <meshStandardMaterial color="#D4AF37" metalness={0.99} roughness={0.08} />
        </mesh>
        <mesh geometry={nozzleHole} position={[0, 0.16, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* 3D Atomizer Mist Spray Jet */}
      {isSpraying && (
        <group position={[0, 0.1, 0.2]}>
          <Sparkles
            count={75}
            size={2.5}
            speed={2.2}
            opacity={0.95}
            color="#FFF4D0"
            scale={[1.5, 2.2, 1.5]}
            noise={0.6}
          />
        </group>
      )}

      {/* Detachable Cap Lid */}
      <group ref={capGroupRef}>
        <mesh geometry={capGeometry}>
          <meshStandardMaterial color={capColor} metalness={0.78} roughness={0.2} />
        </mesh>
        <mesh geometry={capTopGeometry} position={[0, 0.2, 0]}>
          <meshStandardMaterial color={capColor} metalness={0.78} roughness={0.2} />
        </mesh>
        <mesh geometry={capRimGeometry} position={[0, -0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={capColor} metalness={0.82} roughness={0.16} />
        </mesh>
      </group>
    </group>
  );
}

function BottleLabel() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 384;
    const ctx = c.getContext('2d')!;

    ctx.fillStyle = 'rgba(7, 9, 12, 0.96)';
    ctx.fillRect(0, 0, 512, 384);

    // Outer border
    ctx.strokeStyle = '#C8A96B';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 476, 348);

    // Inner border
    ctx.strokeStyle = 'rgba(200,169,107,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 460, 332);

    // Brand name
    ctx.fillStyle = '#C8A96B';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOIRÉ', 256, 112);

    // Decorative line
    const grad = ctx.createLinearGradient(80, 0, 432, 0);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, '#C8A96B');
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 142);
    ctx.lineTo(432, 142);
    ctx.stroke();

    ctx.fillStyle = '#E8D5A5';
    ctx.font = '500 48px Georgia, serif';
    ctx.fillText('OUD', 256, 215);

    // Tagline
    ctx.fillStyle = '#C8A96B';
    ctx.font = '500 20px Arial, sans-serif';
    ctx.fillText('EAU DE PARFUM', 256, 278);

    // Bottom line
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(110, 300);
    ctx.lineTo(402, 300);
    ctx.stroke();

    ctx.fillStyle = '#B8B3AA';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('100 ML · EXTRAIT DE PARFUM', 256, 334);

    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh position={[0, -0.45, 0.34]} rotation={[0, 0, 0]}>
      <planeGeometry args={[1.2, 0.87]} />
      <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} />
    </mesh>
  );
}

function BottleBase() {
  const baseGeometry = useMemo(() => new THREE.CylinderGeometry(0.56, 0.5, 0.06, 40), []);
  return (
    <mesh geometry={baseGeometry} position={[0, -2.03, 0]}>
      <meshStandardMaterial color="#111" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

export default function PerfumeBottle({
  mouseX = 0,
  mouseY = 0,
  onClick,
  bottleColor = '#1a1a2e',
  liquidColor = '#8B4513',
  capColor = '#C8A96B',
  autoRotate = true,
  scale = 1,
  isCapOpen = false,
  isSpraying = false,
}: PerfumeBottleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseRotationY = useRef(0);
  const clicked = useRef(false);
  const clickTime = useRef(0);
  const wasDragged = useRef(false);
  const manualRotationX = useRef(0);
  const manualRotationY = useRef(0);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; rotationX: number; rotationY: number } | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (autoRotate) {
      baseRotationY.current += 0.004;
    }

    const targetX = dragRef.current?.rotationX ?? manualRotationX.current + mouseY * 0.35;
    const targetY = dragRef.current?.rotationY ?? baseRotationY.current + manualRotationY.current + mouseX * 0.45;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.04);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.04);

    if (clicked.current) {
      const elapsed = t - clickTime.current;
      if (elapsed < 1.4) {
        baseRotationY.current += 0.1 * Math.sin(elapsed * 2.5) * Math.exp(-elapsed * 1.5);
      } else {
        clicked.current = false;
      }
    }

    // Breathing float
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.12;
  });

  const handleClick = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    clicked.current = true;
    clickTime.current = 0;
    onClick?.();
  };

  return (
    <group
      ref={groupRef}
      scale={scale}
      onClick={handleClick}
      onPointerDown={(event) => {
        event.stopPropagation();
        wasDragged.current = false;
        const target = event.nativeEvent.target;
        if (target instanceof Element) target.setPointerCapture(event.pointerId);
        dragRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          rotationX: groupRef.current?.rotation.x ?? 0,
          rotationY: groupRef.current?.rotation.y ?? 0,
        };
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y) > 3) {
          wasDragged.current = true;
        }
        drag.rotationY += (event.clientX - drag.x) * 0.008;
        drag.rotationX += (event.clientY - drag.y) * 0.008;
        drag.x = event.clientX;
        drag.y = event.clientY;
      }}
      onPointerUp={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        manualRotationX.current = drag.rotationX;
        manualRotationY.current = drag.rotationY - baseRotationY.current;
        dragRef.current = null;
      }}
      onPointerCancel={() => { dragRef.current = null; }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Floating sparkles around bottle */}
      <Sparkles
        count={35}
        size={0.9}
        speed={0.25}
        opacity={0.4}
        color={capColor}
        scale={[2.5, 6, 2.5]}
        noise={0.4}
      />

      <BottleBase />
      <BottleBody liquidColor={liquidColor} bottleColor={bottleColor} />
      <BottleCap capColor={capColor} isCapOpen={isCapOpen} isSpraying={isSpraying} />
      <BottleLabel />

      {/* Soft ground reflection plane */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Glow halo under bottle */}
      <mesh position={[0, -2.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 48]} />
        <meshBasicMaterial color={liquidColor} transparent opacity={0.07} />
      </mesh>
    </group>
  );
}
