
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'teacher' | 'student' | 'super_admin' | null;

export interface UserRoleData {
  role: UserRole;
  school_id: string | null;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setSchoolId(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, school_id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setUserRole(null);
          setSchoolId(null);
        } else if (data) {
          setUserRole(data.role as UserRole);
          // Super admin doesn't need a specific school context
          setSchoolId(data.role === 'super_admin' ? null : data.school_id);
        } else {
          setUserRole('student');
          setSchoolId(null);
        }
      } catch (error) {
        console.error('Exception fetching user role:', error);
        setUserRole(null);
        setSchoolId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (role: UserRole) => userRole === role;
  const hasAnyRole = (roles: UserRole[]) => roles.includes(userRole);

  return {
    userRole,
    schoolId,
    loading,
    hasRole,
    hasAnyRole,
  };
};
