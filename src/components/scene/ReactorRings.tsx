"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ReactorRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame(() => {
    ring1.current && (ring1.current.rotation.z += 0.020);
    ring2.current && (ring2.current.rotation.x -= 0.015);
    ring3.current && (ring3.current.rotation.y += 0.010);
  });

  return (
    <>
      <mesh ref={ring1}>
        <torusGeometry args={[1.5, 0.03, 32, 120]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2}
        />
      </mesh>

      <mesh ref={ring2}>
        <torusGeometry args={[1.9, 0.025, 32, 120]} />
        <meshStandardMaterial
          color="#6cf5ff"
          emissive="#6cf5ff"
          emissiveIntensity={2}
        />
      </mesh>

      <mesh ref={ring3}>
        <torusGeometry args={[2.3, 0.02, 32, 120]} />
        <meshStandardMaterial
          color="#9cf8ff"
          emissive="#9cf8ff"
          emissiveIntensity={2}
        />
      </mesh>
    </>
  );
}
