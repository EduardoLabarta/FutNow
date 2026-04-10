import { supabase } from '../lib/supabase';

export const authService = {
  signUp: async (email: string, password: string, name: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  }
};
