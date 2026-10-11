"use client";

import { Float } from "@react-three/drei";

export default function FloatingParticles() {
  return (
    <>
      {Array.from({ length: 120 }).map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={1}
          floatIntensity={2}
        >
          <mesh
            position={[
              (Math.random() - 0.5) * 18,
              (Math.random() - 0.5) * 18,
              (Math.random() - 0.5) * 18,
            ]}
          >
            <sphereGeometry args={[0.02]} />
            <meshBasicMaterial color="#00d9ff" />
          </mesh>
        </Float>
      ))}
    </>
  );
}
