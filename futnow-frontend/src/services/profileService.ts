import { supabase } from '../lib/supabase';
import type { Profile, UpdateProfileInput } from '../types/profile';

export const profileService = {
  getProfileById: async (userId: string): Promise<{ data: Profile | null; error: any }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); 
    
    return { data, error };
  },

  updateMyProfile: async (userId: string, input: UpdateProfileInput): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', userId);
    
    return { error };
  },

  getAllProfiles: async (): Promise<{ data: Profile[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  updateProfileStatus: async (targetUserId: string, newStatus: 'ACTIVE' | 'SUSPENDED'): Promise<{ error: any }> => {
    // Endurecido: Invocamos llamada ciega (RPC) delegando el control SQL interno en lugar de exigir accesos de UPDATE a la fuerza
    const { error } = await supabase.rpc('admin_set_user_status', { 
      target_user_id: targetUserId, 
      new_status: newStatus 
    });
    return { error };
  }
};
