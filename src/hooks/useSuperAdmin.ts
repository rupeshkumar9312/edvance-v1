
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export interface SuperAdminStats {
  total_schools: number;
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_revenue: number;
}

export interface SchoolSummary {
  id: string;
  school_name: string;
  school_code: string;
  principal_name: string;
  status: string;
  student_count: number;
  teacher_count: number;
  class_count: number;
  total_revenue: number;
}

export const useSuperAdmin = () => {
  const { userRole } = useUserRole();

  // Fetch overall stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('super_admin_stats')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching super admin stats:', error);
        throw error;
      }

      return data as SuperAdminStats;
    },
    enabled: userRole === 'super_admin',
  });

  // Fetch school-wise summary
  const { data: schoolSummary, isLoading: loadingSchoolSummary } = useQuery({
    queryKey: ['schoolWiseSummary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_wise_summary')
        .select('*');

      if (error) {
        console.error('Error fetching school summary:', error);
        throw error;
      }

      return data as SchoolSummary[];
    },
    enabled: userRole === 'super_admin',
  });

  return {
    stats,
    loadingStats,
    schoolSummary: schoolSummary || [],
    loadingSchoolSummary,
    isSuperAdmin: userRole === 'super_admin',
  };
};
