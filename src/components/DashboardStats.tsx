
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import StatCard from "@/components/StatCard";
import { Users, GraduationCap, BookOpen, DollarSign, Calendar, CheckCircle } from "lucide-react";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  totalRevenue: number;
  totalAttendanceToday: number;
  presentToday: number;
  attendancePercentage: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    totalRevenue: 0,
    totalAttendanceToday: 0,
    presentToday: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const { schoolId, userRole } = useUserRole();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }

      try {
        let studentsCount = 0;
        let classesCount = 0;
        let teacherClassIds: string[] = [];

        if (userRole === 'teacher' && user) {
          // Get teacher's assigned classes first
          const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('id')
            .eq('email', user.email)
            .eq('school_id', schoolId)
            .single();

          if (teacherError || !teacherData) {
            console.log('Teacher not found:', teacherError);
            setStats({
              totalStudents: 0,
              totalTeachers: 0,
              activeClasses: 0,
              totalRevenue: 0,
              totalAttendanceToday: 0,
              presentToday: 0,
              attendancePercentage: 0
            });
            setLoading(false);
            return;
          }

          // Get classes assigned to this teacher
          const { data: teacherClasses, error: classError } = await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', teacherData.id)
            .eq('school_id', schoolId);

          if (classError) throw classError;

          teacherClassIds = teacherClasses?.map(cls => cls.id) || [];
          classesCount = teacherClassIds.length;

          if (teacherClassIds.length > 0) {
            // Get students count for teacher's classes only
            const { count: teacherStudentsCount } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('school_id', schoolId)
              .eq('status', 'active')
              .in('class_id', teacherClassIds);

            studentsCount = teacherStudentsCount || 0;
          }
        } else if (userRole === 'admin') {
          // Fetch students count for admin (all students in school)
          const { count: allStudentsCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('status', 'active');

          studentsCount = allStudentsCount || 0;

          // Fetch classes count for admin (all classes in school)
          const { count: allClassesCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId);

          classesCount = allClassesCount || 0;
        }

        // Fetch teachers count (only for admin)
        let teachersCount = 0;
        if (userRole === 'admin') {
          const { count: allTeachersCount } = await supabase
            .from('teachers')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('status', 'active');

          teachersCount = allTeachersCount || 0;
        }

        // Fetch total revenue (only for admin)
        let totalRevenue = 0;
        if (userRole === 'admin') {
          const { data: revenueData } = await supabase
            .from('fee_records')
            .select('amount')
            .eq('school_id', schoolId)
            .eq('status', 'paid');

          totalRevenue = revenueData?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
        }

        // Fetch today's attendance data
        const today = new Date().toISOString().split('T')[0];
        let attendanceQuery = supabase
          .from('attendance')
          .select('status, student_id')
          .eq('date', today)
          .eq('school_id', schoolId);

        // Filter attendance by teacher's classes if user is teacher
        if (userRole === 'teacher' && teacherClassIds.length > 0) {
          attendanceQuery = attendanceQuery.in('class_id', teacherClassIds);
        }

        const { data: attendanceData } = await attendanceQuery;

        const totalAttendanceToday = attendanceData?.length || 0;
        const presentToday = attendanceData?.filter(record => record.status === 'present').length || 0;
        const attendancePercentage = totalAttendanceToday > 0 ? Math.round((presentToday / totalAttendanceToday) * 100) : 0;

        setStats({
          totalStudents: studentsCount,
          totalTeachers: teachersCount,
          activeClasses: classesCount,
          totalRevenue: totalRevenue,
          totalAttendanceToday: totalAttendanceToday,
          presentToday: presentToday,
          attendancePercentage: attendancePercentage
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [schoolId, userRole, user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsToShow = [];

  // Always show students and classes
  statsToShow.push(
    <StatCard
      key="students"
      title={userRole === 'admin' ? "Total Students" : "My Students"}
      value={stats.totalStudents.toString()}
      icon={Users}
      color="blue"
      change="+12%"
    />,
    <StatCard
      key="classes"
      title={userRole === 'admin' ? "Active Classes" : "My Classes"}
      value={stats.activeClasses.toString()}
      icon={BookOpen}
      color="yellow"
      change="+8%"
    />
  );

  // Show teachers only for admin
  if (userRole === 'admin') {
    statsToShow.push(
      <StatCard
        key="teachers"
        title="Total Teachers"
        value={stats.totalTeachers.toString()}
        icon={GraduationCap}
        color="green"
        change="+3%"
      />
    );
  }

  // Show attendance data
  statsToShow.push(
    <StatCard
      key="attendance"
      title="Attendance Today"
      value={`${stats.presentToday}/${stats.totalAttendanceToday}`}
      icon={CheckCircle}
      color="purple"
      change={`${stats.attendancePercentage}%`}
    />
  );

  // Show revenue only for admin
  if (userRole === 'admin') {
    statsToShow.push(
      <StatCard
        key="revenue"
        title="Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        color="green"
        change="+15%"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow}
    </div>
  );
};

export default DashboardStats;
