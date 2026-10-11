"use client";

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />

      <pointLight
        position={[0, 0, 0]}
        intensity={25}
        color="#00d9ff"
      />

      <pointLight
        position={[3, 3, 3]}
        intensity={4}
        color="#66ffff"
      />

      <pointLight
        position={[-3, -3, -3]}
        intensity={2}
        color="#0088ff"
      />
    </>
  );
}
