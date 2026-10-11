"use client";

import { useEffect } from "react";

import SpeechService from "@/services/speech";
import ARIAController from "@/controllers/ARIAController";

import { useARIAState } from "@/store/ariaState";

export default function VoiceEngine() {
  const setReactor = useARIAState((s) => s.setReactor);

  useEffect(() => {
    let mounted = true;

    // -------------------------------------------------
    // PHASE 6 — NATURAL VOICE CONVERSATION LOOP
    // -------------------------------------------------
    SpeechService.initialize(async (text: string) => {
      if (!mounted) {
        return;
      }

      const query = text.trim();

      if (!query) {
        return;
      }

      try {
        await ARIAController.processVoice(query);
      } catch (error) {
        console.error(
          "[VoiceEngine] Voice command failed:",
          error
        );

        if (mounted) {
          setReactor("ERROR");
        }
      }
    });

    const key = (e: KeyboardEvent) => {
      if (e.code !== "Space") {
        return;
      }

      // Avoid triggering voice control while typing.
      const target = e.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.repeat) {
        return;
      }

      e.preventDefault();

      try {
        ARIAController.toggle();
      } catch (error) {
        console.error(
          "[VoiceEngine] Voice toggle failed:",
          error
        );

        if (mounted) {
          setReactor("ERROR");
        }
      }
    };

    window.addEventListener("keydown", key);

    return () => {
      mounted = false;

      window.removeEventListener("keydown", key);

      SpeechService.stop();
    };
  }, [setReactor]);

  return null;
}