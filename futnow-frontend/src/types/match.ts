export interface Match {
  id: string;
  title: string;
  scheduled_at: string;
  location: string;
  max_players: number;
  status: 'OPEN' | 'CANCELLED';
  organizer_id: string;
  venue_id?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_lat?: number | null;
  venue_lng?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMatchInput {
  title: string;
  scheduled_at: string;
  location: string;
  max_players: number;
  organizer_id: string;
  venue_id?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_lat?: number | null;
  venue_lng?: number | null;
}

export interface MatchParticipant {
  id: string;
  user_id: string;
  profiles: {
    name: string;
    avatar_id: number | null;
    avatar_path: string | null;
  } | null;
}

export interface MatchJoined {
  id: string;
  match_id: string;
  user_id: string;
  status: string;
  matches: Match | null; 
}
