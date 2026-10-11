import { create } from "zustand";

export type ReactorState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "PROCESSING_FILE"
  | "ERROR";

type State = {
  reactor: ReactorState;
  setReactor: (state: ReactorState) => void;
};

export const useARIAState = create<State>((set) => ({
  reactor: "IDLE",
  setReactor: (state) => set({ reactor: state }),
}));
