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
  },

  getAllVenuesAdmin: async (): Promise<{ data: Venue[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name', { ascending: true });
    
    return { data, error };
  },

  createVenue: async (venueData: import('../types/venue').CreateVenueInput): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('venues')
      .insert([venueData]);
    
    return { error };
  },

  updateVenue: async (id: string, venueData: Partial<import('../types/venue').CreateVenueInput>): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', id);
    
    return { error };
  },

  toggleVenueStatus: async (id: string, currentStatus: boolean): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('venues')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    return { error };
  }
};
