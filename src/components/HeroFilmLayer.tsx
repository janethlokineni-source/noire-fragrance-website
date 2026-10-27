import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

interface HeroFilmLayerProps {
  mouseX: number;
  mouseY: number;
  onClick: () => void;
}

export default function HeroFilmLayer({ mouseX, mouseY, onClick }: HeroFilmLayerProps) {
  const texture = useVideoTexture(`${import.meta.env.BASE_URL}perfume-bottle-floating.mp4`, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: 'anonymous',
    preload: 'auto',
  });
  const groupRef = useRef<THREE.Group>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const dragRotation = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);
  const { viewport } = useThree();

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const video = texture.image as HTMLVideoElement;
  const videoAspect = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16 / 9;
  const planeWidth = Math.max(viewport.width, viewport.height * videoAspect) * 1.02;
  const planeHeight = planeWidth / videoAspect;

  const geometry = useMemo(() => {
    const filmGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 48, 32);
    const positions = filmGeometry.attributes.position;
    for (let index = 0; index < positions.count; index++) {
      const x = positions.getX(index);
      positions.setZ(index, 0.2 * (1 - (x / (planeWidth / 2)) ** 2));
    }
    filmGeometry.computeVertexNormals();
    return filmGeometry;
  }, [planeHeight, planeWidth]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uFilm: { value: texture } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uFilm;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(uFilm, vUv);
        gl_FragColor = vec4(color.rgb, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  }), [texture]);

  useEffect(() => () => {
    material.dispose();
    geometry.dispose();
  }, [geometry, material]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const time = clock.getElapsedTime();
    const offsetX = window.innerWidth > 768 ? viewport.width * 0.12 : 0;
    group.position.x += (offsetX - group.position.x) * 0.035;
    const targetX = mouseY * 0.1 + dragRotation.current.x + Math.sin(time * 0.28) * 0.025;
    const targetY = mouseX * 0.16 + dragRotation.current.y + Math.sin(time * 0.2) * 0.045;
    group.rotation.x += (targetX - group.rotation.x) * 0.045;
    group.rotation.y += (targetY - group.rotation.y) * 0.045;
    group.position.y = Math.sin(time * 0.55) * 0.07;
  });

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        if (!event.uv || event.uv.x < 0.32 || event.uv.x > 0.68 || event.uv.y < 0.08 || event.uv.y > 0.92) return;
        onClick();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        const target = event.nativeEvent.target;
        if (target instanceof Element) target.setPointerCapture(event.pointerId);
        dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        dragged.current = false;
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - drag.x;
        const deltaY = event.clientY - drag.y;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 3) dragged.current = true;
        dragRotation.current.y += deltaX * 0.006;
        dragRotation.current.x += deltaY * 0.006;
        drag.x = event.clientX;
        drag.y = event.clientY;
      }}
      onPointerUp={(event) => {
        if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
      }}
      onPointerCancel={() => { dragRef.current = null; }}
    >
      <mesh>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}