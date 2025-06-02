
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "purple" | "orange";
  change?: string;
}

const StatCard = ({ title, value, icon: Icon, color, change }: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-500 text-blue-100",
    green: "bg-green-500 text-green-100",
    yellow: "bg-yellow-500 text-yellow-100",
    purple: "bg-purple-500 text-purple-100",
    orange: "bg-orange-500 text-orange-100",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
