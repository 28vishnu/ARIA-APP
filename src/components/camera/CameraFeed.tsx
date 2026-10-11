"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import CameraService from "@/services/camera";
import ARIAController from "@/controllers/ARIAController";
import { useCameraStore } from "@/store/camera";

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const enabled = useCameraStore((s) => s.enabled);

  const [cameraReady, setCameraReady] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      if (!videoRef.current || !enabled) {
        return;
      }

      try {
        setError(null);
        setCameraReady(false);

        await CameraService.start(videoRef.current);

        if (mounted) {
          setCameraReady(true);
        }
      } catch (err) {
        console.error(
          "[CameraFeed] Camera start failed:",
          err
        );

        if (mounted) {
          setError(
            "Unable to access the camera. Please check camera permissions."
          );
        }
      }
    };

    if (enabled) {
      void startCamera();
    } else {
      CameraService.stop();
      setCameraReady(false);
      setAnalyzing(false);
      setError(null);
    }

    return () => {
      mounted = false;
      CameraService.stop();
    };
  }, [enabled]);

  const capture = useCallback(async () => {
    if (!videoRef.current || !cameraReady || analyzing) {
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const image = CameraService.capture(
        videoRef.current
      );

      if (!image) {
        throw new Error(
          "Camera capture returned no image data."
        );
      }

      await ARIAController.analyzeImage(image);
    } catch (err) {
      console.error(
        "[CameraFeed] Vision capture failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Vision analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  }, [cameraReady, analyzing]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="
        fixed
        bottom-8
        right-8
        z-40
        w-72
      "
    >
      <div className="relative overflow-hidden rounded-2xl">
        <video
          ref={videoRef}
          muted
          playsInline
          className="
            w-full
            rounded-2xl
            border
            border-cyan-500/30
            bg-black
            shadow-2xl
          "
        />

        {!cameraReady && !error && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/70
              text-sm
              text-white
            "
          >
            Starting camera...
          </div>
        )}

        {analyzing && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/60
              text-sm
              font-semibold
              text-white
            "
          >
            ARIA is analyzing...
          </div>
        )}
      </div>

      {error && (
        <div
          className="
            mt-2
            rounded-lg
            bg-red-500/10
            p-2
            text-xs
            text-red-300
          "
        >
          {error}
        </div>
      )}

      <button
        onClick={capture}
        disabled={!cameraReady || analyzing}
        className="
          mt-3
          w-full
          rounded-xl
          bg-cyan-500
          p-2
          font-semibold
          text-black
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {analyzing ? "Analyzing..." : "Capture & Analyze"}
      </button>
    </div>
  );
}