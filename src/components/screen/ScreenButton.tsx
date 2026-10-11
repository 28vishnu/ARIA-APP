"use client";

import { Monitor } from "lucide-react";
import { useScreenStore } from "@/store/screen";

export default function ScreenButton() {
  const enabled = useScreenStore((s) => s.enabled);
  const setEnabled = useScreenStore((s) => s.setEnabled);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="
      fixed
      top-24
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
      <Monitor className="mx-auto" size={24} />
    </button>
  );
}
