"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useARIAState } from "@/store/ariaState";

export default function Reactor() {
  const meshRef = useRef<THREE.Mesh>(null);
  const reactor = useARIAState((s) => s.reactor);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.rotation.x += delta * 0.2;
  });

  const getColor = () => {
    switch (reactor) {
      case "THINKING":
        return "#a855f7"; // Purple
      case "SPEAKING":
        return "#3b82f6"; // Blue
      case "LISTENING":
        return "#10b981"; // Green
      case "PROCESSING_FILE":
        return "#f97316"; // Orange
      case "ERROR":
        return "#ef4444"; // Red
      default:
        return "#00bfff"; // Deep Sky Blue (IDLE)
    }
  };

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={getColor()}
        wireframe
        emissive={getColor()}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
