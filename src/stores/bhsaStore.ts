import { create } from "zustand";
import type { BHSAPassageData, BHSAStatus } from "../types/bhsa";
import { bhsaAPI } from "../services/api";

interface BHSAStore {
  status: BHSAStatus;
  passageCache: Record<string, BHSAPassageData>;
  isPanelOpen: boolean;
  panelRef: string | null;
  panelData: BHSAPassageData | null;

  checkStatus: () => Promise<void>;
  fetchPassage: (book: string, chapter: number, verseStart: number, verseEnd: number) => Promise<BHSAPassageData | null>;
  openPanel: (book: string, chapter: number, verseStart: number, verseEnd: number) => void;
  closePanel: () => void;
}

export const useBHSAStore = create<BHSAStore>((set, get) => ({
  status: { is_loaded: false, is_loading: false, message: "Not checked" },
  passageCache: {},
  isPanelOpen: false,
  panelRef: null,
  panelData: null,

  checkStatus: async () => {
    try {
      const status = await bhsaAPI.getStatus();
      set({ status });
    } catch {
      set({ status: { is_loaded: false, is_loading: false, message: "Status check failed" } });
    }
  },

  fetchPassage: async (book, chapter, verseStart, verseEnd) => {
    const key = `${book}_${chapter}_${verseStart}_${verseEnd}`;
    const cached = get().passageCache[key];
    if (cached) return cached;

    try {
      const data = await bhsaAPI.fetchPassage(book, chapter, verseStart, verseEnd);
      set((s) => ({ passageCache: { ...s.passageCache, [key]: data } }));
      return data;
    } catch {
      return null;
    }
  },

  openPanel: async (book, chapter, verseStart, verseEnd) => {
    const ref = `${book} ${chapter}:${verseStart}-${verseEnd}`;
    set({ isPanelOpen: true, panelRef: ref, panelData: null });
    const data = await get().fetchPassage(book, chapter, verseStart, verseEnd);
    set({ panelData: data });
  },

  closePanel: () => set({ isPanelOpen: false, panelRef: null, panelData: null }),
}));
