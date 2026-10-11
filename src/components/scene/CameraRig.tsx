"use client";

import { useFrame } from "@react-three/fiber";

export default function CameraRig() {
  useFrame(({ camera, clock }) => {
    camera.position.x =
      Math.sin(clock.elapsedTime * 0.2) * 0.3;

    camera.position.y =
      Math.cos(clock.elapsedTime * 0.15) * 0.15;

    camera.lookAt(0, 0, 0);
  });

  return null;
}
