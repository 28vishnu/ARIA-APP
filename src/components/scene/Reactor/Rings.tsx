"use client";

import Ring from "./Ring";

export default function Rings() {
  return (
    <>
      <Ring
        radius={1.5}
        rotationAxis="z"
        speed={0.02}
        color="#00d9ff"
      />

      <Ring
        radius={1.9}
        rotationAxis="x"
        speed={-0.015}
        color="#66ffff"
      />

      <Ring
        radius={2.3}
        rotationAxis="y"
        speed={0.01}
        color="#b0ffff"
      />
    </>
  );
}
