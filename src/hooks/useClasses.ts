
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export interface Class {
  id: string;
  name: string;
  grade: string;
  teacher_id?: string;
  description?: string;
  schedule?: string;
  room?: string;
  capacity: number;
  current_students: number;
  school_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    subject: string;
  };
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'withdrawn';
  created_by?: string;
  updated_by?: string;
  student: {
    id: string;
    name: string;
    email: string;
    roll_number: string;
  };
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole, schoolId } = useUserRole();

  const fetchClasses = async () => {
    try {
      if (!schoolId) {
        console.log('No school context available');
        setClasses([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('classes')
        .select(`
          *,
          teacher:teachers(id, name, email, subject)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (userRole === 'teacher' && user) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('email', user.email)
          .eq('school_id', schoolId)
          .single();

        if (teacherError) {
          console.error('Error fetching teacher data:', teacherError);
          setClasses([]);
          setLoading(false);
          return;
        }

        if (teacherData) {
          query = query.eq('teacher_id', teacherData.id);
        } else {
          setClasses([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch classes: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addClass = async (classData: Omit<Class, 'id' | 'created_at' | 'updated_at' | 'current_students' | 'school_id' | 'created_by' | 'updated_by'>) => {
    try {
      if (!schoolId || !user?.email) {
        throw new Error('No school context or user email available');
      }

      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...classData,
          school_id: schoolId,
          created_by: user.email,
          updated_by: user.email
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchClasses();
      toast({
        title: "Success",
        description: "Class created successfully!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create class: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    try {
      if (!user?.email) {
        throw new Error('User email not available');
      }

      const { data, error } = await supabase
        .from('classes')
        .update({
          ...updates,
          updated_by: user.email
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw error;

      await fetchClasses();
      toast({
        title: "Success",
        description: "Class updated successfully!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update class: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw error;

      setClasses(prev => prev.filter(cls => cls.id !== id));
      toast({
        title: "Success",
        description: "Class deleted successfully!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete class: " + error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const getClassEnrollments = async (classId: string): Promise<ClassEnrollment[]> => {
    try {
      const { data, error } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          student:students(id, name, email, roll_number)
        `)
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch class enrollments: " + error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const enrollStudent = async (classId: string, studentId: string) => {
    try {
      if (!user?.email) {
        throw new Error('User email not available');
      }

      const { data, error } = await supabase
        .from('class_enrollments')
        .insert([{ 
          class_id: classId, 
          student_id: studentId,
          school_id: schoolId,
          created_by: user.email,
          updated_by: user.email
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student enrolled successfully!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to enroll student: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const removeStudentFromClass = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('id', enrollmentId)
        .eq('school_id', schoolId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student removed from class successfully!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove student: " + error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [userRole, user, schoolId]);

  return {
    classes,
    loading,
    fetchClasses,
    addClass,
    updateClass,
    deleteClass,
    getClassEnrollments,
    enrollStudent,
    removeStudentFromClass
  };
};
