
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import SuperAdminStats from '@/components/SuperAdminStats';
import SchoolSummaryTable from '@/components/SchoolSummaryTable';
import { Navigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { isSuperAdmin } = useSuperAdmin();

  if (!isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of all schools and system-wide statistics
        </p>
      </div>

      <SuperAdminStats />

      <SchoolSummaryTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New school "Green Valley Academy" registered</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Total system revenue increased by 15%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">5 new teachers registered across all schools</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System maintenance scheduled for this weekend</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-green-600">85ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-blue-600">234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium text-yellow-600">68%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
