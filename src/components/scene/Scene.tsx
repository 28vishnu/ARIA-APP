"use client";

import { Canvas, useThree } from "@react-three/fiber";

import Camera from "./Camera";
import Lights from "./Lights";
import Reactor from "./Reactor";
import Particles from "./Particles";
import PostProcessing from "./PostProcessing";

function ResponsiveReactor() {
  const { viewport } = useThree();

  const reactorScale =
    viewport.width < 6
      ? 0.48
      : viewport.width < 9
      ? 0.65
      : 0.8;

  return (
    <group scale={reactorScale}>
      <Reactor />
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 10],
        fov: 45,
      }}
      dpr={[1, 2]}
    >
      <Camera />

      <Lights />

      <Particles />

      <ResponsiveReactor />

      <PostProcessing />
    </Canvas>
  );
}
