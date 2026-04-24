export type PitchType = 'FOOTBALL_11' | 'FOOTBALL_7' | 'FUTSAL';

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pitch_type: PitchType;
  players_per_team: number;
  max_players: number;
  is_active: boolean;
  created_at: string;
}
