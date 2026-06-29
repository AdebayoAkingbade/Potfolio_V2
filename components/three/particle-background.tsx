"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";

function createParticles(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color("#7cf7c8"),
    new THREE.Color("#ffb86b"),
    new THREE.Color("#ff7aa2"),
    new THREE.Color("#7aa8ff"),
    new THREE.Color("#f7f3ea"),
  ];

  for (let index = 0; index < count; index += 1) {
    const radius = 2.2 + Math.random() * 3.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const i = index * 3;
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
    positions[i + 2] = radius * Math.cos(phi) - Math.random() * 2.2;

    const color = palette[index % palette.length].clone().lerp(new THREE.Color("#ffffff"), Math.random() * 0.18);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  return { positions, colors };
}

function ParticleField() {
  const pointsRef = React.useRef<THREE.Points>(null);
  const linesRef = React.useRef<THREE.LineSegments>(null);
  const { pointer } = useThree();

  const { particleGeometry, lineGeometry } = React.useMemo(() => {
    const particleCount = 1250;
    const { positions, colors } = createParticles(particleCount);

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const linePositions: number[] = [];
    const maxLines = 160;
    for (let index = 0; index < maxLines; index += 1) {
      const a = Math.floor(Math.random() * particleCount) * 3;
      const b = Math.floor(Math.random() * particleCount) * 3;
      linePositions.push(
        positions[a],
        positions[a + 1],
        positions[a + 2],
        positions[b],
        positions[b + 1],
        positions[b + 2],
      );
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

    return { particleGeometry, lineGeometry };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.025 + pointer.x * 0.18;
      pointsRef.current.rotation.x = pointer.y * 0.08;
      pointsRef.current.position.x = pointer.x * 0.18;
      pointsRef.current.position.y = pointer.y * 0.12;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = -time * 0.018 + pointer.x * 0.12;
      linesRef.current.rotation.x = pointer.y * 0.06;
    }
  });

  return (
    <group>
      <points ref={pointsRef} geometry={particleGeometry}>
        <pointsMaterial
          vertexColors
          size={0.052}
          sizeAttenuation
          transparent
          opacity={0.96}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#7cf7c8"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#090b0f]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 58 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <React.Suspense fallback={null}>
          <ParticleField />
          <Preload all />
        </React.Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,rgba(124,247,200,0.75)_0_1px,transparent_1.6px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent,black_24%,black_78%,transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,11,15,0.1),rgba(9,11,15,0.54)_78%,hsl(var(--background)))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
