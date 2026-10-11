import { create } from "zustand";

type SettingsState = {
  continuousConversation: boolean;
  setContinuousConversation: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  continuousConversation: false,
  setContinuousConversation: (value) =>
    set({ continuousConversation: value }),
}));
