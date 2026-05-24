import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
        const { data: roleData, error } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('email', user.email)
          .single();
        if (error) {
          if (active) {
            setRole(null);
            setIsSuspended(false);
          }
        } else if (active) {
          setRole(roleData?.role || null);
          setIsSuspended(false);
        }
      } catch (err) {
        console.error('Error resolving admin profile:', err);
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
