import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useSchool } from '@/hooks/useSchool';

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  class_id?: string;
  roll_number: string;
  phone?: string;
  status: 'active' | 'inactive';
  image_url?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { userSchool } = useSchool();

  const uploadStudentImage = async (file: File, studentId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('student-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('student-images')
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

  const fetchStudents = async () => {
    try {
      if (!userSchool?.id) {
        console.log('No school context available');
        setStudents([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('students')
        .select('*')
        .eq('school_id', userSchool.id)
        .order('created_at', { ascending: false });

      // If user is a teacher, only show students from their assigned classes
      if (userRole === 'teacher' && user) {
        // First get the teacher record for this user
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('email', user.email)
          .eq('school_id', userSchool.id)
          .single();

        if (teacherError) {
          console.error('Error fetching teacher data:', teacherError);
          setStudents([]);
          setLoading(false);
          return;
        }

        if (teacherData) {
          // Get classes assigned to this teacher
          const { data: teacherClasses, error: classError } = await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', teacherData.id)
            .eq('school_id', userSchool.id);

          if (classError) throw classError;

          if (teacherClasses && teacherClasses.length > 0) {
            const classIds = teacherClasses.map(cls => cls.id);
            query = query.in('class_id', classIds);
          } else {
            // Teacher has no assigned classes, show no students
            setStudents([]);
            setLoading(false);
            return;
          }
        } else {
          // Teacher not found, show no students
          setStudents([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Only log when there are actual students and avoid logging all student data
      if (data && data.length > 0) {
        console.log('Students fetched successfully:', {
          count: data.length,
          studentsWithClassId: data.filter(s => s.class_id).length,
          studentsWithoutClassId: data.filter(s => !s.class_id).length
        });
      }
      
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'school_id'> & { class_id?: string }, imageFile?: File) => {
    try {
      if (!userSchool?.id) {
        throw new Error('No school context available');
      }

      console.log('Adding student with data:', studentData);
      
      // First, add the student with school_id
      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .insert([{
          name: studentData.name,
          email: studentData.email,
          class: studentData.class,
          class_id: studentData.class_id || null,
          roll_number: studentData.roll_number,
          phone: studentData.phone,
          status: studentData.status,
          school_id: userSchool.id
        }])
        .select()
        .single();

      if (studentError) throw studentError;

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadStudentImage(imageFile, studentRecord.id);
        if (imageUrl) {
          const { error: updateError } = await supabase
            .from('students')
            .update({ image_url: imageUrl })
            .eq('id', studentRecord.id);
          
          if (updateError) {
            console.error('Failed to update student with image URL:', updateError);
          } else {
            studentRecord.image_url = imageUrl;
          }
        }
      }

      // If class_id is provided, create enrollment
      if (studentData.class_id) {
        const { error: enrollmentError } = await supabase
          .from('class_enrollments')
          .insert([{
            class_id: studentData.class_id,
            student_id: studentRecord.id,
            status: 'active',
            school_id: userSchool.id
          }]);

        if (enrollmentError) {
          console.error('Failed to enroll student in class:', enrollmentError);
          // Don't throw here, student was created successfully
        }
      }
      
      await fetchStudents(); // Refresh the list
      toast({
        title: "Success",
        description: "Student added successfully!",
      });
      return { data: studentRecord, error: null };
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>, imageFile?: File) => {
    try {
      let imageUrl = updates.image_url;
      
      if (imageFile) {
        imageUrl = await uploadStudentImage(imageFile, id);
        if (imageUrl) {
          updates.image_url = imageUrl;
        }
      }

      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchStudents(); // Refresh the list
      toast({
        title: "Success",
        description: "Student updated successfully!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update student: " + error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete student: " + error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (userRole !== null && userSchool) {
      fetchStudents();
    }
  }, [userRole, user, userSchool]);

  return {
    students,
    loading,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent
  };
};
