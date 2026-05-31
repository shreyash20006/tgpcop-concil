import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { Role } from '../hooks/useRole';

type AuthContextType = {
  role: Role | null;
  email: string | null;
  userId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isSuspended: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  email: null,
  userId: null,
  fullName: null,
  avatarUrl: null,
  isSuspended: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    const resolveProfile = async (userSession: any) => {
      if (!userSession?.user) {
        if (active) {
          setRole(null);
          setIsSuspended(false);
          setIsLoading(false);
        }
        return;
      }
      try {
        const user = userSession.user;
        
        // Fetch user profile from unified public.profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error || !profileData) {
          // Fallback: If no profile was created by the DB trigger, insert client-side dynamically to ensure 100% login success
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Student',
              avatar_url: user.user_metadata?.avatar_url || null,
              role: 'student',
              is_active: true
            })
            .select()
            .single();

          if (!insertError && newProfile && active) {
            setRole(newProfile.role as Role);
            setIsSuspended(!newProfile.is_active);
          } else if (active) {
            setRole('student');
            setIsSuspended(false);
          }
        } else if (active) {
          setRole(profileData.role as Role);
          setIsSuspended(!profileData.is_active);
        }
      } catch (err) {
        console.error('Error resolving unified user profile:', err);
        if (active) {
          setRole(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (active) setSession(initSession);
      resolveProfile(initSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) setSession(newSession);
      resolveProfile(newSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        role,
        email: session?.user?.email ?? null,
        userId: session?.user?.id ?? null,
        fullName: session?.user?.user_metadata?.full_name ?? null,
        avatarUrl: session?.user?.user_metadata?.avatar_url ?? null,
        isSuspended,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
