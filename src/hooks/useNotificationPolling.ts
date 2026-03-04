import { useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";

const POLL_INTERVAL_MS = 180_000; // 3 minutes

export function useNotificationPolling() {
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchUnreadCount]);
}
