import { create } from "zustand";

type DocumentState = {
  uploaded: boolean;
  filename: string;
  summary: string;

  setDocument: (
    filename: string,
    summary: string
  ) => void;

  clear: () => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  uploaded: false,
  filename: "",
  summary: "",

  setDocument: (filename, summary) =>
    set({
      uploaded: true,
      filename,
      summary,
    }),

  clear: () =>
    set({
      uploaded: false,
      filename: "",
      summary: "",
    }),
}));
