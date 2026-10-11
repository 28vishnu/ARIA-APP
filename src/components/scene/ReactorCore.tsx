"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useARIAStore } from "@/store/aria";

export default function ReactorCore() {
  const mesh = useRef<THREE.Mesh>(null);

  const state = useARIAStore((s) => s.state);

  useFrame(({ clock }) => {
    if (!mesh.current) return;

    const material = mesh.current.material as THREE.MeshStandardMaterial;

    let color = "#00d9ff";
    let intensity = 3;
    let scale = 1;

    switch (state) {
      case "LISTENING":
        color = "#00ffff";
        intensity = 6;
        scale = 1.08;
        break;

      case "THINKING":
        color = "#8a2be2";
        intensity = 8;
        scale = 1.12;
        break;

      case "SPEAKING":
        color = "#4da6ff";
        intensity = 10;
        scale = 1.18;
        break;

      case "PROCESSING_FILE":
        color = "#ff9800";
        intensity = 8;
        scale = 1.15;
        break;

      case "ERROR":
        color = "#ff3333";
        intensity = 10;
        scale = 1.08;
        break;

      default:
        intensity = 3 + Math.sin(clock.elapsedTime * 2) * 1.2;
        scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.03;
    }

    material.color.set(color);
    material.emissive.set(color);
    material.emissiveIntensity = intensity;

    mesh.current.rotation.y += 0.004;
    mesh.current.rotation.x += 0.001;
    mesh.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 5]} />
      <meshStandardMaterial
        color="#00d9ff"
        emissive="#00d9ff"
        emissiveIntensity={4}
        metalness={1}
        roughness={0.05}
      />
    </mesh>
  );
}
