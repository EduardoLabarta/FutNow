import { supabase } from '../lib/supabase';
import type { Profile, UpdateProfileInput } from '../types/profile';
import type { ServiceError } from '../types/service';

export const profileService = {
  getProfileById: async (userId: string): Promise<{ data: Profile | null; error: ServiceError }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return { data, error };
  },

  uploadAvatar: async (userId: string, file: File): Promise<{ path: string | null; error: ServiceError }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) return { path: null, error };
    return { path: data.path, error: null };
  },

  removeAvatar: async (path: string): Promise<{ error: ServiceError }> => {
    const { error } = await supabase.storage.from('avatars').remove([path]);
    return { error };
  },

  updateMyProfile: async (userId: string, input: UpdateProfileInput): Promise<{ error: ServiceError }> => {
    const { error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', userId);

    return { error };
  },

  getAllProfiles: async (): Promise<{ data: Profile[] | null; error: ServiceError }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  updateProfileStatus: async (targetUserId: string, newStatus: 'ACTIVE' | 'SUSPENDED'): Promise<{ error: ServiceError }> => {
    const { error } = await supabase.rpc('admin_set_user_status', {
      target_user_id: targetUserId,
      new_status: newStatus,
    });

    return { error };
  },
};
