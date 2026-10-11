"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  radius: number;
  segments: number;
  speed: number;
  color: string;
};

export default function SegmentRing({
  radius,
  segments,
  speed,
  color,
}: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.z += speed;
    }
  });

  const items = useMemo(() => {
    return Array.from({ length: segments }, (_, i) => {
      const angle = (i / segments) * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r: angle,
      };
    });
  }, [radius, segments]);

  return (
    <group ref={group}>
      {items.map((item, index) => (
        <mesh
          key={index}
          position={[item.x, item.y, 0]}
          rotation={[0, 0, item.r]}
        >
          <boxGeometry args={[0.18, 0.04, 0.03]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}
