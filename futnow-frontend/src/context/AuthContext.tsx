import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Profile } from '../types/profile';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse estrictamente dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfileData = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await profileService.getProfileById(userId);
      if (error) {
        console.error("Error cargando el perfil de Supabase:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Excepción crítica conectando al servicio de Perfiles:", err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const newProfile = await loadProfileData(user.id);
      setProfile(newProfile);
    }
  };

  useEffect(() => {
    let isMounted = true; 

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            setTimeout(() => {
              loadProfileData(initialSession.user.id).then((loadedProfile) => {
                if (isMounted) {
                  setProfile(loadedProfile);
                  setLoading(false);
                }
              });
            }, 0);
          } else {
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error obteniendo la sesión inicial:", error);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          setTimeout(() => {
            loadProfileData(newSession.user.id).then((loadedProfile) => {
              if (isMounted) {
                setProfile(loadedProfile);
                setLoading(false);
              }
            });
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // <-- Corrección vital: Dependencia arreglada.

  const handleSignOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error crítico cerrando sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut: handleSignOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
