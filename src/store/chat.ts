import { create } from "zustand";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: Message[];

  addUser: (text: string) => void;

  addAssistant: (text: string) => void;

  clear: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  addUser: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "user", content: text },
      ],
    })),

  addAssistant: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "assistant", content: text },
      ],
    })),

  clear: () => set({ messages: [] }),
}));
