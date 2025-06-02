import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  time_recorded: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  school_id: string;
  student_name: string;
  roll_number: string;
  class_name: string;
}

export interface AttendanceStats {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export interface AttendanceSummary {
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_rate: number;
}

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    total_students: 0,
    present_count: 0,
    absent_count: 0,
    late_count: 0,
    attendance_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole, schoolId } = useUserRole();

  const fetchAttendance = async (date?: string, classId?: string) => {
    try {
      if (!schoolId) {
        console.log('No school context available');
        setAttendanceRecords([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(id, name, roll_number, email, class),
          class:classes(name, grade)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      // For teachers, filter by their assigned classes
      if (userRole === 'teacher' && user) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('email', user.email)
          .eq('school_id', schoolId)
          .single();

        if (teacherError || !teacherData) {
          console.error('Error fetching teacher data:', teacherError);
          setAttendanceRecords([]);
          setLoading(false);
          return;
        }

        const { data: teacherClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', teacherData.id)
          .eq('school_id', schoolId);

        if (classError) throw classError;

        const teacherClassIds = teacherClasses?.map(cls => cls.id) || [];
        if (teacherClassIds.length > 0) {
          query = query.in('class_id', teacherClassIds);
        } else {
          setAttendanceRecords([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match the expected structure
      const transformedData = data?.map((record: any) => ({
        id: record.id,
        student_id: record.student_id,
        class_id: record.class_id,
        date: record.date,
        status: record.status,
        notes: record.notes,
        time_recorded: record.time_recorded,
        created_at: record.created_at,
        updated_at: record.updated_at,
        created_by: record.created_by,
        updated_by: record.updated_by,
        school_id: record.school_id,
        student_name: record.student?.name || '',
        roll_number: record.student?.roll_number || '',
        class_name: record.class ? `${record.class.name} - ${record.class.grade}` : ''
      })) || [];

      setAttendanceRecords(transformedData);

      // Fetch summary for the selected date
      if (date) {
        await fetchAttendanceSummary(date, classId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async (date: string, classId?: string) => {
    try {
      if (!schoolId) return;

      // Pass school_id to the RPC function to ensure school isolation
      const { data, error } = await supabase.rpc('get_attendance_summary', {
        target_date: date,
        target_class_id: classId === 'all' ? null : classId,
        target_school_id: schoolId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setSummary({
          total_students: data[0].total_students,
          present_count: data[0].present_count,
          absent_count: data[0].absent_count,
          late_count: data[0].late_count,
          attendance_rate: data[0].attendance_rate
        });
      }
    } catch (error: any) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const markAttendance = async (studentId: string, classId: string, date: string, status: 'present' | 'absent' | 'late', notes?: string) => {
    try {
      if (!schoolId || !user?.email) {
        throw new Error('No school context or user email available');
      }

      // Check if attendance already exists
      const { data: existing, error: checkError } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('date', date)
        .eq('school_id', schoolId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            status, 
            notes,
            updated_by: user.email
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert([{
            student_id: studentId,
            class_id: classId,
            date,
            status,
            notes,
            school_id: schoolId,
            created_by: user.email,
            updated_by: user.email
          }]);

        if (error) throw error;
      }

      await fetchAttendance();
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark attendance: " + error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const bulkMarkAttendance = async (attendanceList: Array<{
    student_id: string;
    class_id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
  }>) => {
    try {
      if (!schoolId || !user?.email) {
        throw new Error('No school context or user email available');
      }

      const attendanceData = attendanceList.map(item => ({
        ...item,
        school_id: schoolId,
        created_by: user.email,
        updated_by: user.email
      }));

      // Use upsert to handle existing records
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceData, {
          onConflict: 'student_id,class_id,date,school_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance marked successfully for all students!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark bulk attendance: " + error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const getAttendanceStats = async (date: string, classId?: string): Promise<AttendanceStats> => {
    try {
      if (!schoolId) {
        return { totalStudents: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 };
      }

      let query = supabase
        .from('attendance')
        .select('status')
        .eq('date', date)
        .eq('school_id', schoolId);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      // For teachers, filter by their assigned classes
      if (userRole === 'teacher' && user) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('email', user.email)
          .eq('school_id', schoolId)
          .single();

        if (teacherError || !teacherData) {
          return { totalStudents: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 };
        }

        const { data: teacherClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', teacherData.id)
          .eq('school_id', schoolId);

        if (classError) throw classError;

        const teacherClassIds = teacherClasses?.map(cls => cls.id) || [];
        if (teacherClassIds.length > 0) {
          query = query.in('class_id', teacherClassIds);
        } else {
          return { totalStudents: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 };
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalStudents = data?.length || 0;
      const present = data?.filter(record => record.status === 'present').length || 0;
      const absent = data?.filter(record => record.status === 'absent').length || 0;
      const late = data?.filter(record => record.status === 'late').length || 0;
      const attendanceRate = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;

      return {
        totalStudents,
        present,
        absent,
        late,
        attendanceRate
      };
    } catch (error: any) {
      console.error('Error fetching attendance stats:', error);
      return { totalStudents: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 };
    }
  };

  useEffect(() => {
    if (schoolId) {
      const today = new Date().toISOString().split('T')[0];
      fetchAttendance(today);
    }
  }, [userRole, user, schoolId]);

  return {
    attendanceRecords,
    summary,
    loading,
    fetchAttendance,
    markAttendance,
    bulkMarkAttendance,
    getAttendanceStats
  };
};
