import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
  ThumbsUp,
} from "lucide-react";
import { useNotificationStore } from "../../../stores/notificationStore";
import { cn } from "../../../utils/cn";
import type { Notification } from "../../../types/notification";
import { Button } from "../../ui/button";

const EVENT_ICONS: Record<string, typeof Bell> = {
  map_approved: ThumbsUp,
  revisions_requested: RotateCcw,
  feedback_added: MessageSquare,
  feedback_resolved: CheckCircle2,
};

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

function NotificationCard({
  notification,
  onRead,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (mapId: string) => void;
}) {
  const Icon = EVENT_ICONS[notification.event_type] || Bell;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-areia/30 bg-surface p-4 transition-all duration-200 hover:shadow-md hover:border-telha/30",
        !notification.is_read && "border-l-4 border-l-telha"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
          notification.is_read ? "bg-areia/20 text-verde" : "bg-telha/10 text-telha"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-sm leading-tight",
              notification.is_read ? "text-verde" : "font-semibold text-preto"
            )}
          >
            {notification.title}
          </h3>
          <span className="flex-shrink-0 text-[11px] text-areia">
            {timeAgo(notification.created_at)}
          </span>
        </div>

        <p className="mt-0.5 text-xs text-verde">{notification.body}</p>

        {notification.pericope_reference && (
          <span className="mt-1.5 inline-block rounded-full bg-azul/10 px-2 py-0.5 text-[11px] font-medium text-azul">
            {notification.pericope_reference}
          </span>
        )}

        <div className="mt-2 flex items-center gap-3">
          {notification.related_map_id && (
            <button
              onClick={() => onNavigate(notification.related_map_id!)}
              className="text-xs font-medium text-telha hover:text-telha/80"
            >
              View map
            </button>
          )}
          {!notification.is_read && (
            <button
              onClick={() => onRead(notification.id)}
              className="text-xs text-verde hover:text-preto"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type FilterMode = "all" | "unread";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterMode>("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(filter === "unread");
  }, [filter, fetchNotifications]);

  const handleNavigate = (mapId: string) => {
    navigate(`/app/maps/${mapId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-bold tracking-tight text-preto">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-verde">
              {unreadCount} unread notification{unreadCount !== 1 && "s"}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            className="gap-1.5 border-areia text-verde hover:border-telha/30 hover:text-preto"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-1 rounded-lg border border-areia/30 bg-surface p-1">
        {(["all", "unread"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === mode
                ? "bg-telha text-white"
                : "text-verde hover:bg-areia/10 hover:text-preto"
            )}
          >
            {mode === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-areia border-t-telha" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-areia/30 bg-surface py-16">
          <Bell className="mb-3 h-10 w-10 text-areia" />
          <p className="text-sm font-medium text-preto">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-xs text-verde">
            {filter === "unread"
              ? "You're all caught up!"
              : "Notifications will appear here when your maps are reviewed."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onRead={markAsRead}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
