"use client";

import { Stars } from "@react-three/drei";

export default function Environment() {
  return (
    <Stars
      radius={120}
      depth={80}
      count={4000}
      factor={5}
      fade
    />
  );
}