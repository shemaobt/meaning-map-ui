import { toast } from "sonner";
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
  dirtySections: Record<string, unknown>;

  fetchList: (bookId: string) => Promise<void>;
  fetchBCD: (bcdId: string) => Promise<void>;
  fetchFeedback: (bcdId: string) => Promise<void>;
  fetchLogs: (bcdId: string) => Promise<void>;
  startPolling: (bcdId: string) => void;
  stopPolling: () => void;
  clear: () => void;
  markDirty: (sectionKey: string, data: unknown) => void;
  clearDirty: (sectionKey: string) => void;
  clearAllDirty: () => void;
  isDirty: () => boolean;
  saveAllDirty: (
    bcdId: string,
    locale: string,
  ) => Promise<{ saved: number; failed: string[] }>;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let pollFailures = 0;
const MAX_POLL_FAILURES = 5;

export const useBCDStore = create<BCDStore>((set, get) => ({
  list: [],
  currentBCD: null,
  feedback: [],
  generationLogs: [],
  isLoading: false,
  isPolling: false,
  dirtySections: {},

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
    pollFailures = 0;
    set({ isPolling: true });

    pollingInterval = setInterval(async () => {
      try {
        const [bcd, logs] = await Promise.all([
          bookContextAPI.get(bcdId),
          bookContextAPI.getLogs(bcdId),
        ]);
        pollFailures = 0;
        set({ currentBCD: bcd, generationLogs: logs });

        if (bcd.status !== "generating") {
          get().stopPolling();
          const hasFailed = logs.some((l) => l.status === "failed");
          if (hasFailed) {
            const failedStep = logs.find((l) => l.status === "failed");
            toast.error(
              failedStep?.error_detail || "Generation failed. Check the logs for details.",
            );
          } else {
            set({ generationLogs: [] });
          }
        }
      } catch {
        pollFailures++;
        if (pollFailures >= MAX_POLL_FAILURES) {
          get().stopPolling();
          toast.error("Lost connection to generation progress. Refresh to reconnect.");
        }
      }
    }, 5000);
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
      dirtySections: {},
    });
  },

  markDirty: (sectionKey, data) => {
    set((s) => ({ dirtySections: { ...s.dirtySections, [sectionKey]: data } }));
  },

  clearDirty: (sectionKey) => {
    set((s) => {
      const next = { ...s.dirtySections };
      delete next[sectionKey];
      return { dirtySections: next };
    });
  },

  clearAllDirty: () => {
    set({ dirtySections: {} });
  },

  isDirty: () => Object.keys(get().dirtySections).length > 0,

  saveAllDirty: async (bcdId, locale) => {
    const entries = Object.entries(get().dirtySections);
    const failed: string[] = [];
    for (const [key, data] of entries) {
      try {
        await bookContextAPI.updateSection(bcdId, key, data, locale);
      } catch {
        failed.push(key);
      }
    }
    set((s) => {
      const next = { ...s.dirtySections };
      for (const key of Object.keys(next)) {
        if (!failed.includes(key)) delete next[key];
      }
      return { dirtySections: next };
    });
    try {
      await get().fetchBCD(bcdId);
    } catch {
      // ignore — caller already has success/failure info
    }
    return { saved: entries.length - failed.length, failed };
  },
}));
