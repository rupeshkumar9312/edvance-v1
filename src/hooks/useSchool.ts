
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  website?: string;
  logo_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const useSchool = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's school context
  const { data: userSchool, isLoading: loadingUserSchool } = useQuery({
    queryKey: ['userSchool', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          school_id,
          schools:school_id (
            id,
            name,
            code,
            address,
            phone,
            email,
            principal_name,
            website,
            logo_url,
            status
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user school:', error);
        return null;
      }

      // Handle the case where schools is an array (which it shouldn't be, but let's be safe)
      const schoolData = Array.isArray(data?.schools) ? data.schools[0] : data?.schools;
      return schoolData as School || null;
    },
    enabled: !!user,
  });

  // Get all schools (available to everyone, including non-authenticated users)
  const { data: schools, isLoading: loadingSchools, error: schoolsError } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }

      return data as School[];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 3,
  });

  // Create school mutation
  const createSchool = useMutation({
    mutationFn: async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });

  // Update school mutation
  const updateSchool = useMutation({
    mutationFn: async ({ id, ...schoolData }: Partial<School> & { id: string }) => {
      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['userSchool'] });
    },
  });

  return {
    userSchool,
    loadingUserSchool,
    schools: schools || [],
    loadingSchools,
    schoolsError,
    createSchool,
    updateSchool,
  };
};
