
import { useState } from "react";
import { User, Search, Edit, Trash2, Plus } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import AddStudentDialog from "@/components/AddStudentDialog";
import EditStudentDialog from "@/components/EditStudentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserRole } from "@/hooks/useUserRole";

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const { students, loading, deleteStudent, updateStudent } = useStudents();
  const { classes, loading: classesLoading } = useClasses();
  const { userRole } = useUserRole();

  console.log('Classes in Students page:', classes);
  console.log('Students data:', students);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === "all" || student.class === classFilter;
    
    return matchesSearch && matchesClass;
  });

  const handleDeleteStudent = async (id: string, name: string) => {
    if (userRole !== 'admin') return;
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteStudent(id);
    }
  };

  const handleUpdateStudent = async (id: string, updates: any, imageFile?: File) => {
    if (userRole !== 'admin') return;
    await updateStudent(id, updates, imageFile);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">
            {userRole === 'admin' ? 'Manage student records and information' : 'View students in your classes'}
          </p>
        </div>
        {userRole === 'admin' && <AddStudentDialog />}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={classesLoading ? "Loading..." : "Filter by class"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classesLoading ? (
                <SelectItem value="loading" disabled>Loading classes...</SelectItem>
              ) : classes.length > 0 ? (
                classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.name}>
                    {classItem.name} ({classItem.grade})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-classes" disabled>No classes available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-4">
              {students.length === 0 
                ? userRole === 'admin' 
                  ? "Get started by adding your first student."
                  : "No students in your assigned classes yet."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {students.length === 0 && userRole === 'admin' && <AddStudentDialog />}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Student</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Registration Number</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Class</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Status</th>
                  {userRole === 'admin' && (
                    <th className="text-left py-3 px-6 font-medium text-gray-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.image_url} alt={student.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">{student.roll_number}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{student.class}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{student.phone || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    {userRole === 'admin' && (
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <EditStudentDialog student={student} onUpdate={handleUpdateStudent} />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {students.filter(s => s.status === 'inactive').length}
            </div>
            <div className="text-sm text-gray-500">Inactive Students</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
