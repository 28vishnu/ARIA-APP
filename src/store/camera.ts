import { create } from "zustand";

type CameraState = {
  enabled: boolean;
  ready: boolean;
  analyzing: boolean;
  error: string | null;

  setEnabled: (enabled: boolean) => void;
  setReady: (ready: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;

  reset: () => void;
};

export const useCameraStore = create<CameraState>((set) => ({
  enabled: false,
  ready: false,
  analyzing: false,
  error: null,

  setEnabled: (enabled) =>
    set({
      enabled,
      ...(enabled
        ? {}
        : {
            ready: false,
            analyzing: false,
            error: null,
          }),
    }),

  setReady: (ready) =>
    set({
      ready,
    }),

  setAnalyzing: (analyzing) =>
    set({
      analyzing,
    }),

  setError: (error) =>
    set({
      error,
    }),

  reset: () =>
    set({
      enabled: false,
      ready: false,
      analyzing: false,
      error: null,
    }),
}));