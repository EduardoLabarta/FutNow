import { supabase } from '../lib/supabase';
import type { AppNotification } from '../types/notification';
import type { ServiceError } from '../types/service';

export const notificationService = {
  getNotifications: async (): Promise<{ data: AppNotification[] | null; error: ServiceError }> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data as AppNotification[] | null, error };
  },

  getUnreadCount: async (): Promise<{ count: number | null; error: ServiceError }> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return { count, error };
  },

  markAsRead: async (notificationId: string): Promise<{ error: ServiceError }> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return { error };
  },

  markAllAsRead: async (): Promise<{ error: ServiceError }> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    return { error };
  },
};
