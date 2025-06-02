
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  phone?: string;
  experience?: string;
  status: 'active' | 'inactive';
  image_url?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { schoolId } = useUserRole();

  const uploadTeacherImage = async (file: File, teacherId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teacherId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('teacher-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image: " + error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchTeachers = async () => {
    try {
      if (!schoolId) {
        console.log('No school context available');
        setTeachers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTeacher = async (teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at' | 'school_id'>, imageFile?: File) => {
    try {
      if (!schoolId) {
        throw new Error('No school context available');
      }

      console.log('Creating teacher record:', teacherData.email);

      const { data: teacherRecord, error: teacherError } = await supabase
        .from('teachers')
        .insert([{
          name: teacherData.name,
          email: teacherData.email,
          subject: teacherData.subject,
          phone: teacherData.phone,
          experience: teacherData.experience,
          status: teacherData.status,
          school_id: schoolId
        }])
        .select()
        .single();

      if (teacherError) {
        console.error('Teacher record error:', teacherError);
        throw teacherError;
      }

      console.log('Teacher record created successfully:', teacherRecord.id);

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadTeacherImage(imageFile, teacherRecord.id);
        if (imageUrl) {
          const { error: updateError } = await supabase
            .from('teachers')
            .update({ image_url: imageUrl })
            .eq('id', teacherRecord.id);
          
          if (updateError) {
            console.error('Failed to update teacher with image URL:', updateError);
          } else {
            teacherRecord.image_url = imageUrl;
          }
        }
      }
      
      await fetchTeachers();
      toast({
        title: "Success",
        description: "Teacher added successfully! They can now sign up using their email address.",
      });
      return { data: teacherRecord, error: null };
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: "Failed to add teacher: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>, imageFile?: File) => {
    try {
      let imageUrl = updates.image_url;
      
      if (imageFile) {
        imageUrl = await uploadTeacherImage(imageFile, id);
        if (imageUrl) {
          updates.image_url = imageUrl;
        }
      }

      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw error;

      await fetchTeachers();
      toast({
        title: "Success",
        description: "Teacher updated successfully!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update teacher: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw error;

      setTeachers(prev => prev.filter(teacher => teacher.id !== id));
      toast({
        title: "Success",
        description: "Teacher deleted successfully!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete teacher: " + error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchTeachers();
    }
  }, [schoolId]);

  return {
    teachers,
    loading,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher
  };
};
