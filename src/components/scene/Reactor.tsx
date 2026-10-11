"use client";

import { useCallback } from "react";

import ReactorCore from "./ReactorCore";
import ReactorRings from "./ReactorRings";

import SpeechService from "@/services/speech";
import { useARIAStore } from "@/store/aria";

export default function Reactor() {
  const setState = useARIAStore((state) => state.setState);

  const startListening = useCallback(() => {
    setState("LISTENING");
    SpeechService.start();
  }, [setState]);

  return (
    <group onPointerDown={startListening}>
      <ReactorCore />
      <ReactorRings />
    </group>
  );
}
