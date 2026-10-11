"use client";

import { Stars } from "@react-three/drei";

export default function Particles() {
  return (
    <Stars
      radius={150}
      depth={100}
      count={7000}
      factor={5}
      saturation={0}
      fade
    />
  );
}
