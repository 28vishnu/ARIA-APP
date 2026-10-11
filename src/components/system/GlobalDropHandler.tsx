"use client";

import { useEffect } from "react";

import { useARIAState } from "@/store/ariaState";
import ARIAController from "@/controllers/ARIAController";

export default function GlobalDropHandler() {
  const setReactor = useARIAState((s) => s.setReactor);

  useEffect(() => {
    const over = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const leave = () => {
      setReactor("IDLE");
    };

    const drop = async (e: DragEvent) => {
      e.preventDefault();

      const files = e.dataTransfer?.files;

      if (!files || files.length === 0) {
        setReactor("IDLE");
        return;
      }

      try {
        setReactor("PROCESSING_FILE");

        for (const file of Array.from(files)) {
          const result = await ARIAController.upload(file);

          console.log(result);
        }
      } catch (error: any) {
        console.error(error);

        setReactor("ERROR");
      }
    };

    document.addEventListener("dragover", over, true);
    document.addEventListener("drop", drop, true);
    document.addEventListener("dragleave", leave, true);

    return () => {
      document.removeEventListener("dragover", over, true);
      document.removeEventListener("drop", drop, true);
      document.removeEventListener("dragleave", leave, true);
    };
  }, [setReactor]);

  return null;
}
