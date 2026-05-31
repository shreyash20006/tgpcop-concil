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
        console.log('[useAuth] No active session found.');
        if (active) {
          setRole(null);
          setIsSuspended(false);
          setIsLoading(false);
        }
        return;
      }
      try {
        const user = userSession.user;
        console.log(`[useAuth] Active session user: email=${user.email}, id=${user.id}`);
        
        // Fetch user profile from unified public.profiles table by user ID
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[useAuth] Database error fetching profile by ID:', error);
        }

        if (profileData) {
          console.log(`[useAuth] Found profile for ID ${user.id}: email=${profileData.email}, role=${profileData.role}, is_active=${profileData.is_active}`);
          if (active) {
            setRole(profileData.role as Role);
            setIsSuspended(!profileData.is_active);
          }
        } else {
          console.warn(`[useAuth] No profile found in profiles table for ID ${user.id}. Querying by email fallback...`);
          
          // Fallback: Check if a profile exists under this email (e.g. pre-seeded or mismatched ID)
          const { data: profileByEmail, error: emailErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (emailErr) {
            console.error('[useAuth] Database error fetching profile by email fallback:', emailErr);
          }

          if (profileByEmail) {
            console.log(`[useAuth] SELF-HEALING: Found profile by email ${user.email} but with mismatched ID! Database ID=${profileByEmail.id}, Google ID=${user.id}. Role=${profileByEmail.role}`);
            // Note: Directly updating profiles.id client-side may fail due to RLS policies.
            // We set the role from the found email profile so the UI functions immediately.
            if (active) {
              setRole(profileByEmail.role as Role);
              setIsSuspended(!profileByEmail.is_active);
            }
          } else {
            console.log(`[useAuth] No profile exists for email ${user.email} either. Creating a new student profile client-side...`);
            
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

            if (insertError) {
              console.error('[useAuth] Client-side profile creation failed:', insertError);
              if (active) {
                setRole('student');
                setIsSuspended(false);
              }
            } else if (newProfile && active) {
              console.log('[useAuth] Client-side student profile successfully created:', newProfile);
              setRole(newProfile.role as Role);
              setIsSuspended(!newProfile.is_active);
            }
          }
        }
      } catch (err) {
        console.error('[useAuth] Exception in resolveProfile:', err);
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
