import { create } from "zustand";

export type ARIAState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "PROCESSING_FILE"
  | "ERROR";

interface Store {
  state: ARIAState;
  setState: (state: ARIAState) => void;
}

export const useARIAStore = create<Store>((set) => ({
  state: "IDLE",
  setState: (state) => set({ state }),
}));
