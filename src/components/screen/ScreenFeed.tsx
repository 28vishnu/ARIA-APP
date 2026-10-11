"use client";

import { useEffect, useRef } from "react";

import ScreenService from "@/services/screen";
import { useScreenStore } from "@/store/screen";
import ARIAController from "@/controllers/ARIAController";

export default function ScreenFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const enabled = useScreenStore((s) => s.enabled);

  useEffect(() => {
    if (!videoRef.current) return;

    if (enabled) {
      ScreenService.start(videoRef.current);
    } else {
      ScreenService.stop();
    }
  }, [enabled]);

  const capture = async () => {
    if (!videoRef.current) return;

    const image = ScreenService.capture(videoRef.current);

    await ARIAController.analyzeImage(image);
  };

  if (!enabled) return null;

  return (
    <div
      className="
      fixed
      bottom-8
      left-8
      z-40
    "
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="
        w-80
        rounded-2xl
        border
        border-cyan-500/30
        shadow-2xl
      "
      />

      <button
        onClick={capture}
        className="
        mt-3
        w-full
        rounded-xl
        bg-cyan-500
        p-2
        text-black
        font-semibold
      "
      >
        Analyze Screen
      </button>
    </div>
  );
}
