export interface Profile {
  id: string;
  name: string;
  avatar_id: number | null;
  preferred_position: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileInput {
  name: string;
  avatar_id: number | null;
  preferred_position: string | null;
}
