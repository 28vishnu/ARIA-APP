"use client";

import { useChatStore } from "@/store/chat";

export default function Conversation() {
  const messages = useChatStore((s) => s.messages);

  if (messages.length === 0) return null;

  return (
    <div
      className="
      fixed
      right-6
      top-24
      w-96
      max-h-[70vh]
      overflow-y-auto
      rounded-2xl
      bg-black/60
      backdrop-blur-xl
      border
      border-cyan-500/30
      p-4
      z-50
    "
    >
      {messages.map((m, i) => (
        <div
          key={i}
          className={`mb-4 ${
            m.role === "user"
              ? "text-cyan-300"
              : "text-white"
          }`}
        >
          <div className="text-xs opacity-60">
            {m.role === "user" ? "You" : "ARIA"}
          </div>

          <div className="mt-1">
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}
