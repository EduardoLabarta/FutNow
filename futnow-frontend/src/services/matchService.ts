import { supabase } from '../lib/supabase';
import type { Match, CreateMatchInput, MatchParticipant, MatchJoined } from '../types/match';

export const matchService = {
  getUpcomingMatches: async (): Promise<{ data: Match[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'OPEN')
      .gt('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });
    
    return { data, error };
  },

  createMatch: async (input: CreateMatchInput): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('matches')
      .insert([input]);
    
    return { error };
  },

  getMatchById: async (matchId: string): Promise<{ data: Match | null; error: any }> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();

    return { data, error };
  },

  getConfirmedParticipants: async (matchId: string): Promise<{ data: MatchParticipant[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('match_inscriptions')
      .select(`
        id,
        user_id,
        profiles (
          name,
          avatar_id
        )
      `)
      .eq('match_id', matchId)
      .eq('status', 'CONFIRMED')
      .order('created_at', { ascending: true });

    return { data: data as any, error };
  },

  joinMatch: async (matchId: string): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase.rpc('join_match', { p_match_id: matchId });
    return { data, error };
  },

  leaveMatch: async (matchId: string): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase.rpc('leave_match', { p_match_id: matchId });
    return { data, error };
  },

  cancelMatch: async (matchId: string): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'CANCELLED' })
      .eq('id', matchId);
    
    return { error };
  },

  getMatchesOrganizedByUser: async (userId: string): Promise<{ data: Match[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('organizer_id', userId)
      .order('scheduled_at', { ascending: true });
      
    return { data, error };
  },

  getMatchesJoinedByUser: async (userId: string): Promise<{ data: MatchJoined[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('match_inscriptions')
      .select(`
        id,
        match_id,
        user_id,
        status,
        matches (
          id,
          title,
          scheduled_at,
          location,
          max_players,
          status,
          organizer_id
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'CONFIRMED');

    // JS Ordenación de fechas anidadas ya que el Join REST de PostgREST a veces complica la cadena de orderBy sin Foreign Data Wrapper
    let sortedData = data as any;
    if (sortedData && !error) {
       sortedData.sort((a: any, b: any) => {
          if (!a.matches || !b.matches) return 0;
          return new Date(a.matches.scheduled_at).getTime() - new Date(b.matches.scheduled_at).getTime();
       });
    }

    return { data: sortedData, error };
  },

  getAllMatchesAdmin: async (): Promise<{ data: Match[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('scheduled_at', { ascending: false });
      
    return { data, error };
  }
};
