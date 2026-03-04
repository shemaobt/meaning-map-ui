import { create } from "zustand";
import type { Notification } from "../types/notification";
import { notificationsAPI } from "../services/api";

interface NotificationStore {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;

  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  notifications: [],
  isLoading: false,

  fetchUnreadCount: async () => {
    try {
      const { count } = await notificationsAPI.unreadCount();
      set({ unreadCount: count });
    } catch {
      // silently fail — polling will retry
    }
  },

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true });
    try {
      const notifications = await notificationsAPI.list({
        unread_only: unreadOnly,
        limit: 50,
      });
      set({ notifications, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllAsRead();
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },
}));
