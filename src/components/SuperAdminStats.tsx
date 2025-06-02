
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import StatCard from "@/components/StatCard";
import { Building2, Users, GraduationCap, BookOpen, DollarSign } from "lucide-react";

const SuperAdminStats = () => {
  const { stats, loadingStats } = useSuperAdmin();

  if (loadingStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        title="Total Schools"
        value={stats.total_schools.toString()}
        icon={Building2}
        color="blue"
        change="+5%"
      />
      <StatCard
        title="Total Students"
        value={stats.total_students.toString()}
        icon={Users}
        color="green"
        change="+12%"
      />
      <StatCard
        title="Total Teachers"
        value={stats.total_teachers.toString()}
        icon={GraduationCap}
        color="purple"
        change="+8%"
      />
      <StatCard
        title="Total Classes"
        value={stats.total_classes.toString()}
        icon={BookOpen}
        color="orange"
        change="+15%"
      />
      <StatCard
        title="Total Revenue"
        value={`$${(stats.total_revenue / 100).toLocaleString()}`}
        icon={DollarSign}
        color="green"
        change="+20%"
      />
    </div>
  );
};

export default SuperAdminStats;
