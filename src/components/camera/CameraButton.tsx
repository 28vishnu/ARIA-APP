"use client";

import { Camera } from "lucide-react";
import { useCameraStore } from "@/store/camera";

export default function CameraButton() {
  const enabled = useCameraStore((s) => s.enabled);
  const setEnabled = useCameraStore((s) => s.setEnabled);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="
        fixed
        top-6
        right-6
        z-50
        h-14
        w-14
        rounded-full
        bg-cyan-500/20
        border
        border-cyan-400/30
        backdrop-blur-xl
        text-cyan-300
        hover:bg-cyan-500/30
        transition
      "
    >
      <Camera className="mx-auto" size={24} />
    </button>
  );
}
