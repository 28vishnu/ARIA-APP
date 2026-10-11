"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.0}
        luminanceThreshold={0.45}
        luminanceSmoothing={0.95}
        mipmapBlur
      />
    </EffectComposer>
  );
}
