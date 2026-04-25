export type NotificationType = 'MATCH_JOINED' | 'MATCH_LEFT' | 'MATCH_CANCELLED' | 'ACCOUNT_STATUS';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_match_id?: string | null;
  created_at: string;
}
