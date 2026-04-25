import { supabase } from '../lib/supabase';
import type { AppNotification } from '../types/notification';

export const notificationService = {
  getNotifications: async (): Promise<{ data: AppNotification[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data: data as AppNotification[] | null, error };
  },

  getUnreadCount: async (): Promise<{ count: number | null; error: any }> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    
    return { count, error };
  },

  markAsRead: async (notificationId: string): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    return { error };
  },

  markAllAsRead: async (): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    return { error };
  }
};
