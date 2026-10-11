"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type RingProps = {
  radius: number;
  rotationAxis: "x" | "y" | "z";
  speed: number;
  color: string;
};

export default function Ring({
  radius,
  rotationAxis,
  speed,
  color,
}: RingProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation[rotationAxis] += speed;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, 0.02, 24, 180]} />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        metalness={1}
        roughness={0.08}
      />
    </mesh>
  );
}
