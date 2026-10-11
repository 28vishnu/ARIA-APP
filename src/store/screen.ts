import { create } from "zustand";

type ScreenState = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

export const useScreenStore = create<ScreenState>((set) => ({
  enabled: false,
  setEnabled: (v) => set({ enabled: v }),
}));
