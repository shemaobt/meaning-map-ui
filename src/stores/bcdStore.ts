import { create } from "zustand";
import type { BCD, BCDFeedback, BCDGenerationLog, BCDListItem } from "../types/bookContext";
import { bookContextAPI } from "../services/api";

interface BCDStore {
  list: BCDListItem[];
  currentBCD: BCD | null;
  feedback: BCDFeedback[];
  generationLogs: BCDGenerationLog[];
  isLoading: boolean;
  isPolling: boolean;

  fetchList: (bookId: string) => Promise<void>;
  fetchBCD: (bcdId: string) => Promise<void>;
  fetchFeedback: (bcdId: string) => Promise<void>;
  fetchLogs: (bcdId: string) => Promise<void>;
  startPolling: (bcdId: string) => void;
  stopPolling: () => void;
  clear: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export const useBCDStore = create<BCDStore>((set, get) => ({
  list: [],
  currentBCD: null,
  feedback: [],
  generationLogs: [],
  isLoading: false,
  isPolling: false,

  fetchList: async (bookId) => {
    set({ isLoading: true });
    try {
      const list = await bookContextAPI.list(bookId);
      set({ list });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBCD: async (bcdId) => {
    set({ isLoading: true });
    try {
      const bcd = await bookContextAPI.get(bcdId);
      set({ currentBCD: bcd });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeedback: async (bcdId) => {
    const feedback = await bookContextAPI.listFeedback(bcdId);
    set({ feedback });
  },

  fetchLogs: async (bcdId) => {
    const logs = await bookContextAPI.getLogs(bcdId);
    set({ generationLogs: logs });
  },

  startPolling: (bcdId) => {
    get().stopPolling();
    set({ isPolling: true });

    pollingInterval = setInterval(async () => {
      try {
        const [bcd, logs] = await Promise.all([
          bookContextAPI.get(bcdId),
          bookContextAPI.getLogs(bcdId),
        ]);
        set({ currentBCD: bcd, generationLogs: logs });

        if (bcd.status !== "generating") {
          get().stopPolling();
          set({ generationLogs: [] });
        }
      } catch {
        get().stopPolling();
      }
    }, 3000);
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isPolling: false });
  },

  clear: () => {
    get().stopPolling();
    set({
      list: [],
      currentBCD: null,
      feedback: [],
      generationLogs: [],
      isLoading: false,
    });
  },
}));
