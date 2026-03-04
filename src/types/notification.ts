export interface Notification {
  id: string;
  user_id: string;
  app_id: string;
  event_type: string;
  actor_id: string | null;
  actor_name: string | null;
  related_map_id: string | null;
  pericope_reference: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountResponse {
  count: number;
}
