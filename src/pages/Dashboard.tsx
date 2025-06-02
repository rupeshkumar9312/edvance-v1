
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SchoolHeader from "@/components/SchoolHeader";
import DashboardStats from "@/components/DashboardStats";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Calendar, FileText } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();

  // Redirect super admin to their specialized dashboard
  useEffect(() => {
    if (userRole === 'super_admin') {
      navigate('/super-admin');
    }
  }, [userRole, navigate]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-student':
        navigate('/students');
        break;
      case 'record-attendance':
        navigate('/attendance');
        break;
      case 'generate-reports':
        navigate('/fees');
        break;
      case 'add-teacher':
        navigate('/teachers');
        break;
      case 'add-class':
        navigate('/classes');
        break;
      default:
        break;
    }
  };

  const getQuickActions = () => {
    if (userRole === 'admin') {
      return [
        {
          id: 'add-student',
          title: 'Add New Student',
          description: 'Register a new student to the system',
          icon: UserPlus,
          color: 'blue'
        },
        {
          id: 'add-teacher',
          title: 'Add New Teacher',
          description: 'Register a new teacher to the system',
          icon: Plus,
          color: 'green'
        },
        {
          id: 'record-attendance',
          title: 'Record Attendance',
          description: 'Mark today\'s attendance for classes',
          icon: Calendar,
          color: 'purple'
        },
        {
          id: 'generate-reports',
          title: 'Generate Reports',
          description: 'Create performance and financial reports',
          icon: FileText,
          color: 'orange'
        }
      ];
    } else if (userRole === 'teacher') {
      return [
        {
          id: 'record-attendance',
          title: 'Record Attendance',
          description: 'Mark today\'s attendance for your classes',
          icon: Calendar,
          color: 'green'
        },
        {
          id: 'view-students',
          title: 'View Students',
          description: 'View students in your classes',
          icon: UserPlus,
          color: 'blue'
        }
      ];
    }
    return [];
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      <SchoolHeader />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          {userRole === 'admin' 
            ? 'Welcome to your school management system' 
            : 'Welcome to your teaching dashboard'
          }
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {userRole === 'admin' 
                  ? 'New student John Doe enrolled in Grade 10'
                  : 'Attendance marked for Grade 10A'
                }
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {userRole === 'admin'
                  ? 'Fee payment received from Sarah Wilson'
                  : 'Grade submitted for Mathematics quiz'
                }
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {userRole === 'admin'
                  ? 'Teacher meeting scheduled for tomorrow'
                  : 'Parent meeting scheduled for Friday'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  className="w-full justify-start p-4 h-auto"
                  onClick={() => handleQuickAction(action.id)}
                >
                  <div className={`p-2 rounded-lg mr-3 bg-${action.color}-50`}>
                    <Icon className={`h-5 w-5 text-${action.color}-600`} />
                  </div>
                  <div className="text-left">
                    <div className={`font-medium text-${action.color}-900`}>{action.title}</div>
                    <div className={`text-sm text-${action.color}-600`}>{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
