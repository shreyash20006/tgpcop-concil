import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Role = 
  | 'super_admin' 
  | 'admin' 
  | 'secretary' 
  | 'events' 
  | 'gallery' 
  | 'questions' 
  | 'treasurer' 
  | 'limited';

export interface AdminUser {
  email: string;
  name: string;
  role: Role;
}

export function getRoleDisplayName(role: Role): string {
  const labels: Record<Role, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    secretary: 'Secretary',
    events: 'Events',
    gallery: 'Gallery',
    questions: 'Questions',
    treasurer: 'Treasurer',
    limited: 'Limited',
  };
  return labels[role];
}

export function getPositionTitle(role: Role): string {
  const titles: Record<Role, string> = {
    super_admin: 'President',
    admin: 'Executive',
    secretary: 'Secretary',
    events: 'Events Coordinator',
    gallery: 'Gallery Manager',
    questions: 'Questions Manager',
    treasurer: 'Treasurer',
    limited: 'Council Member',
  };
  return titles[role];
}

export function useRole() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error: queryError } = await supabase
          .from('admin_roles')
          .select('email, name, role')
          .eq('email', session.user.email)
          .single();

        if (queryError) {
          setError('User role not found');
          setLoading(false);
          return;
        }

        setAdminUser(data as AdminUser);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setError('Failed to fetch user role');
        setLoading(false);
      }
    }

    fetchRole();
  }, []);

  const can = (action: string): boolean => {
    if (!adminUser) return false;
    const role = adminUser.role;

    const permissions: Record<string, Role[]> = {
      'view_questions': [
        'super_admin',
        'admin',
        'secretary',
        'questions',
        'limited',
      ],
      'reply_questions': [
        'super_admin',
        'admin',
        'secretary',
        'questions',
      ],
      'delete_questions': [
        'super_admin',
        'admin',
      ],
      'add_notices': [
        'super_admin',
        'admin',
        'secretary',
      ],
      'edit_notices': [
        'super_admin',
        'admin',
        'secretary',
      ],
      'delete_notices': [
        'super_admin',
        'admin',
      ],
      'add_events': [
        'super_admin',
        'admin',
        'events',
      ],
      'edit_events': [
        'super_admin',
        'admin',
        'events',
      ],
      'delete_events': [
        'super_admin',
        'admin',
      ],
      'upload_gallery': [
        'super_admin',
        'admin',
        'events',
        'gallery',
      ],
      'delete_gallery': [
        'super_admin',
        'admin',
      ],
      'manage_settings': [
        'super_admin',
      ],
      'view_dashboard': [
        'super_admin',
        'admin',
        'secretary',
        'events',
        'gallery',
        'questions',
        'treasurer',
        'limited',
      ],
    };

    return permissions[action]?.includes(role) ?? false;
  };

  return {
    adminUser,
    loading,
    error,
    can,
  };
}

export default useRole;
