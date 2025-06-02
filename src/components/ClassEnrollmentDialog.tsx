
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useClasses, ClassEnrollment } from '@/hooks/useClasses';

interface ClassEnrollmentDialogProps {
  classId: string;
  className: string;
}

const ClassEnrollmentDialog = ({ classId, className }: ClassEnrollmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { students } = useStudents();
  const { getClassEnrollments, enrollStudent, removeStudentFromClass } = useClasses();

  const loadEnrollments = async () => {
    const data = await getClassEnrollments(classId);
    setEnrollments(data);
  };

  useEffect(() => {
    if (open) {
      loadEnrollments();
    }
  }, [open, classId]);

  const handleEnrollStudent = async () => {
    if (!selectedStudentId) return;
    
    setLoading(true);
    const { error } = await enrollStudent(classId, selectedStudentId);
    
    if (!error) {
      setSelectedStudentId('');
      await loadEnrollments();
    }
    setLoading(false);
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    setLoading(true);
    const { error } = await removeStudentFromClass(enrollmentId);
    
    if (!error) {
      await loadEnrollments();
    }
    setLoading(false);
  };

  const enrolledStudentIds = enrollments.map(e => e.student_id);
  const availableStudents = students.filter(student => 
    !enrolledStudentIds.includes(student.id) && student.status === 'active'
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-900">
          <Users className="h-4 w-4 mr-1" />
          Manage Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Students - {className}</DialogTitle>
          <DialogDescription>
            Add or remove students from this class.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Student Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Add Student to Class</h4>
            <div className="flex space-x-2">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a student to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.roll_number} ({student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleEnrollStudent} 
                disabled={!selectedStudentId || loading}
                className="px-3"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current Students Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Current Students ({enrollments.length})</h4>
            {enrollments.length === 0 ? (
              <p className="text-gray-500 text-sm">No students enrolled in this class yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{enrollment.student.name}</div>
                      <div className="text-sm text-gray-500">
                        Roll: {enrollment.student.roll_number} • {enrollment.student.email}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStudent(enrollment.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassEnrollmentDialog;
