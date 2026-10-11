"use client";

import { OrbitControls } from "@react-three/drei";

export default function Camera() {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      autoRotate
      autoRotateSpeed={0.4}
    />
  );
}