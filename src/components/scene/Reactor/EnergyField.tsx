"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useARIAState } from "@/store/ariaState";

export default function EnergyField() {
  const ref = useRef<THREE.Mesh>(null);
  const state = useARIAState((s) => s.reactor);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    const material = ref.current.material as THREE.MeshBasicMaterial;

    let pulse = 1.45;
    let opacity = 0.2;

    switch (state) {
      case "LISTENING":
        pulse = 1.55 + Math.sin(t * 8) * 0.05;
        opacity = 0.35;
        break;

      case "THINKING":
        pulse = 1.5 + Math.sin(t * 4) * 0.08;
        opacity = 0.28;
        break;

      case "SPEAKING":
        pulse = 1.6 + Math.sin(t * 10) * 0.06;
        opacity = 0.4;
        break;

      default:
        pulse = 1.45 + Math.sin(t * 2) * 0.05;
        opacity = 0.18;
    }

    ref.current.scale.setScalar(pulse);
    material.opacity = opacity;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.25, 64, 64]} />
      <meshBasicMaterial
        color="#00d9ff"
        transparent
        opacity={0.22}
      />
    </mesh>
  );
}
