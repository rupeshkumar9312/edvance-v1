
import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { useClasses } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MarkAttendanceDialog } from "@/components/MarkAttendanceDialog";
import { useUserRole } from "@/hooks/useUserRole";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  
  const { attendanceRecords, summary, loading, fetchAttendance } = useAttendance();
  const { classes } = useClasses();
  const { userRole } = useUserRole();

  useEffect(() => {
    fetchAttendance(selectedDate, selectedClass);
  }, [selectedDate, selectedClass]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "late":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">
            {userRole === 'admin' 
              ? 'Track and manage student attendance'
              : 'Mark attendance for your classes'
            }
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'teacher') && (
          <MarkAttendanceDialog 
            selectedDate={selectedDate}
            selectedClass={selectedClass}
            onSuccess={() => fetchAttendance(selectedDate, selectedClass)}
          />
        )}
      </div>

      {/* Date and Class Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {userRole === 'admin' && <option value="all">All Classes</option>}
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total_students}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">{summary.present_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{summary.absent_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary.attendance_rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance Records - {new Date(selectedDate).toLocaleDateString()}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Roll No.</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Student</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Class</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Time</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-900">{record.roll_number}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {record.student_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.class_name}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{formatTime(record.time_recorded)}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {attendanceRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendance records found for the selected date and class.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
