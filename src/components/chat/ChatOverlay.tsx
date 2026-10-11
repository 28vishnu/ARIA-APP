"use client";

import { useDocumentStore } from "@/store/document";

export default function ChatOverlay() {
  const uploaded = useDocumentStore((s) => s.uploaded);
  const filename = useDocumentStore((s) => s.filename);

  if (!uploaded) return null;

  return (
    <div
      className="
      fixed
      bottom-6
      left-1/2
      -translate-x-1/2
      z-50
      w-[90%]
      max-w-lg
      rounded-2xl
      border
      border-cyan-500/30
      bg-black/70
      backdrop-blur-xl
      p-4
      text-white
      shadow-2xl
    "
    >
      <p className="text-cyan-400 font-semibold">
        Active Document
      </p>

      <p className="mt-2 text-sm">
        {filename}
      </p>

      <p className="mt-4 text-xs text-gray-400">
        Try saying:
      </p>

      <p className="mt-1 text-cyan-300">
        "Summarize this document"
      </p>
    </div>
  );
}
