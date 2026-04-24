import { supabase } from '../lib/supabase';
import type { Venue } from '../types/venue';

export const venueService = {
  getActiveVenues: async (): Promise<{ data: Venue[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    return { data, error };
  },

  getVenueById: async (venueId: string): Promise<{ data: Venue | null; error: any }> => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .maybeSingle();
      
    return { data, error };
  }
};
