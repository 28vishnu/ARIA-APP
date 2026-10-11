"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useARIAState } from "@/store/ariaState";

export default function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  const state = useARIAState((s) => s.reactor);

  useFrame(({ clock }) => {
    if (!mesh.current) return;

    const material = mesh.current.material as THREE.MeshStandardMaterial;

    const t = clock.elapsedTime;

    let color = "#00d9ff";
    let intensity = 4;
    let scale = 1;

    switch (state) {
      case "LISTENING":
        color = "#00ffff";
        intensity = 6;
        scale = 1.08;
        break;

      case "THINKING":
        color = "#9b5cff";
        intensity = 8;
        scale = 1.06;
        mesh.current.rotation.y += 0.02;
        break;

      case "SPEAKING":
        color = "#3399ff";
        intensity = 8;
        scale = 1.1;
        break;

      case "PROCESSING_FILE":
        color = "#ff9900";
        intensity = 8;
        scale = 1.08;
        break;

      case "ERROR":
        color = "#ff3333";
        intensity = 8;
        scale = 1.08;
        break;

      default:
        intensity = 4 + Math.sin(t * 2) * 1.5;
        scale = 1 + Math.sin(t * 2) * 0.02;
        mesh.current.rotation.y += 0.003;
        break;
    }

    material.color.set(color);
    material.emissive.set(color);
    material.emissiveIntensity = intensity;

    mesh.current.scale.lerp(
      new THREE.Vector3(scale, scale, scale),
      0.08
    );
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.6, 5]} />

      <meshStandardMaterial
        color="#00d9ff"
        emissive="#00d9ff"
        emissiveIntensity={4}
        metalness={1}
        roughness={0.08}
      />
    </mesh>
  );
}
