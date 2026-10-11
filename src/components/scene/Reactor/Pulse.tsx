"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Pulse() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    ref.current.scale.setScalar(1.8 + Math.sin(t * 2) * 0.15);

    const material = ref.current.material as THREE.MeshBasicMaterial;

    material.opacity = 0.05 + Math.sin(t * 2) * 0.03;
  });

  return (
    <mesh ref={ref}>
      <ringGeometry args={[1.8, 2.0, 128]} />

      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
