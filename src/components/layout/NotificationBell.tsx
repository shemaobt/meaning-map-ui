import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useNotificationStore } from "../../stores/notificationStore";
import { cn } from "../../utils/cn";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { unreadCount, notifications, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-1.5 text-verde transition-colors hover:bg-areia/20"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-telha px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-areia/30 bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-areia/20 px-4 py-2.5">
            <span className="text-sm font-semibold text-preto">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-xs text-telha hover:text-telha/80"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-verde">
                No notifications yet
              </div>
            ) : (
              recentNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                    if (n.related_map_id) {
                      navigate(`/app/maps/${n.related_map_id}`);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-b border-areia/10 px-4 py-3 text-left transition-colors hover:bg-areia/10",
                    !n.is_read && "bg-azul/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm leading-tight",
                        n.is_read ? "text-verde" : "font-medium text-preto"
                      )}
                    >
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-telha" />
                    )}
                  </div>
                  <span className="line-clamp-1 text-xs text-verde">{n.body}</span>
                  <span className="text-[11px] text-areia">{timeAgo(n.created_at)}</span>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-areia/20 px-4 py-2">
            <button
              onClick={() => {
                navigate("/app/notifications");
                setOpen(false);
              }}
              className="flex w-full items-center justify-center gap-1 text-xs font-medium text-telha hover:text-telha/80"
            >
              View all
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
