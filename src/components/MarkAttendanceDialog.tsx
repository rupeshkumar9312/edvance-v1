import { useState, useEffect } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import { useClasses } from "@/hooks/useClasses";

interface MarkAttendanceDialogProps {
  selectedDate: string;
  selectedClass: string;
  onSuccess: () => void;
}

export const MarkAttendanceDialog = ({ selectedDate, selectedClass, onSuccess }: MarkAttendanceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [submitting, setSubmitting] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  
  const { students } = useStudents();
  const { classes } = useClasses();
  const { bulkMarkAttendance } = useAttendance();

  // Filter students based on selected class - only when dialog is open
  useEffect(() => {
    if (!open) return; // Don't filter if dialog is closed
    
    const filtered = selectedClass === 'all' 
      ? students.filter(s => s.status === 'active')
      : students.filter(s => {
          const isActive = s.status === 'active';
          const hasMatchingClass = s.class_id === selectedClass;
          return isActive && hasMatchingClass;
        });

    setFilteredStudents(filtered);

    // Detailed logging only when dialog is open
    console.log('Attendance Dialog - Class Filter Applied:', {
      selectedClass: selectedClass,
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      filteredStudents: filtered.length,
      studentsInSelectedClass: filtered.map(s => ({ name: s.name, class_id: s.class_id }))
    });

    // Show warning if no students found for specific class
    if (selectedClass !== 'all' && filtered.length === 0) {
      console.warn(`No active students found for class ${selectedClass}. Check if students have class_id set properly.`);
    }
  }, [students, selectedClass, open]);

  // Initialize attendance data
  useEffect(() => {
    const initialData: Record<string, 'present' | 'absent' | 'late'> = {};
    filteredStudents.forEach(student => {
      initialData[student.id] = 'present'; // Default to present
    });
    setAttendanceData(initialData);
  }, [filteredStudents]);

  const getClassNameForStudent = (student: any) => {
    if (selectedClass === 'all') {
      const studentClass = classes.find(c => c.id === student.class_id);
      return studentClass ? `${studentClass.name} - ${studentClass.grade}` : student.class;
    }
    const cls = classes.find(c => c.id === selectedClass);
    return cls ? `${cls.name} - ${cls.grade}` : student.class;
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (filteredStudents.length === 0) {
      console.log('No students to mark attendance for');
      return;
    }

    setSubmitting(true);
    
    const attendanceList = filteredStudents.map(student => {
      // For "all" classes, use the student's actual class_id
      // For specific class, use the selected class ID
      const classId = selectedClass === 'all' ? student.class_id : selectedClass;
      
      if (!classId) {
        console.error('Invalid class_id for student:', student);
        return null;
      }

      return {
        student_id: student.id,
        class_id: classId,
        date: selectedDate,
        status: attendanceData[student.id] || 'absent'
      };
    }).filter(Boolean); // Remove null entries

    console.log('Attendance list to submit:', attendanceList);

    if (attendanceList.length === 0) {
      console.error('No valid attendance records to submit');
      setSubmitting(false);
      return;
    }

    const result = await bulkMarkAttendance(attendanceList);
    
    if (result.error === null) {
      setOpen(false);
      onSuccess();
    }
    
    setSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusButtonClass = (status: string, currentStatus: string) => {
    const isSelected = status === currentStatus;
    const baseClass = "flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ";
    
    switch (status) {
      case "present":
        return baseClass + (isSelected 
          ? "bg-green-100 text-green-800 border-green-300" 
          : "bg-gray-100 text-gray-600 hover:bg-green-50");
      case "absent":
        return baseClass + (isSelected 
          ? "bg-red-100 text-red-800 border-red-300" 
          : "bg-gray-100 text-gray-600 hover:bg-red-50");
      case "late":
        return baseClass + (isSelected 
          ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
          : "bg-gray-100 text-gray-600 hover:bg-yellow-50");
      default:
        return baseClass + "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Mark attendance for {new Date(selectedDate).toLocaleDateString()} 
            {selectedClass !== 'all' && ` - ${classes.find(c => c.id === selectedClass)?.name}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Debug info for troubleshooting - only show when dialog is open */}
          {open && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Debug: Total students: {students.length}, Active: {students.filter(s => s.status === 'active').length}, 
              Filtered for this class: {filteredStudents.length}, Selected class: {selectedClass}
              {selectedClass !== 'all' && filteredStudents.length === 0 && (
                <div className="text-red-600 mt-1">
                  ⚠️ No students found. Check if students have class_id assigned properly.
                </div>
              )}
            </div>
          )}
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedClass === 'all' 
                  ? 'No active students found.' 
                  : 'No students found for the selected class. Students may not have their class_id properly set.'}
              </p>
              {selectedClass !== 'all' && (
                <div className="text-gray-400 text-sm mt-2">
                  <p>Troubleshooting tips:</p>
                  <ul className="list-disc list-inside text-left max-w-md mx-auto">
                    <li>Check if students have been assigned to this class</li>
                    <li>Verify students have their class_id field populated</li>
                    <li>Try selecting "All Classes" to see if students appear</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Roll No.</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Student</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Class</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm text-gray-900">{student.roll_number}</td>
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="py-3 px-3 text-sm text-gray-500">{getClassNameForStudent(student)}</td>
                        <td className="py-3 px-3">
                          <div className="flex space-x-2">
                            {(['present', 'late', 'absent'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id, status)}
                                className={getStatusButtonClass(status, attendanceData[student.id])}
                              >
                                {getStatusIcon(status)}
                                <span className="capitalize">{status}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Marking..." : "Mark Attendance"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
