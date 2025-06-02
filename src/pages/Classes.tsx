
import { BookOpen, Users, Clock, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import CreateClassDialog from "@/components/CreateClassDialog";
import EditClassDialog from "@/components/EditClassDialog";
import ClassEnrollmentDialog from "@/components/ClassEnrollmentDialog";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

const Classes = () => {
  const { classes, loading, addClass, updateClass, deleteClass } = useClasses();
  const { userRole } = useUserRole();

  const handleDeleteClass = async (id: string, name: string) => {
    if (userRole !== 'admin') return;
    if (window.confirm(`Are you sure you want to delete "${name}"? This will remove all student enrollments.`)) {
      await deleteClass(id);
    }
  };

  const handleUpdateClass = async (id: string, updates: any) => {
    if (userRole !== 'admin') return;
    await updateClass(id, updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">
            {userRole === 'admin' ? 'Manage class schedules and assignments' : 'View your assigned classes'}
          </p>
        </div>
        {userRole === 'admin' && <CreateClassDialog onSubmit={addClass} />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {userRole === 'admin' ? 'Total Classes' : 'Your Classes'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((total, cls) => total + (cls.current_students || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.filter(cls => cls.teacher_id).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.length > 0 ? Math.round(classes.reduce((total, cls) => total + cls.capacity, 0) / classes.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-500 mb-4">
            {userRole === 'admin' 
              ? "Get started by creating your first class." 
              : "No classes have been assigned to you yet."
            }
          </p>
          {userRole === 'admin' && <CreateClassDialog onSubmit={addClass} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-500">{classItem.grade}</p>
                  </div>
                </div>
                {userRole === 'admin' && (
                  <div className="flex space-x-2">
                    <EditClassDialog classData={classItem} onUpdate={handleUpdateClass} />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {classItem.teacher && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Teacher:</span>
                    <span className="ml-1">{classItem.teacher.name}</span>
                  </div>
                )}
                
                {classItem.schedule && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Schedule:</span>
                    <span className="ml-1">{classItem.schedule}</span>
                  </div>
                )}

                {classItem.description && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span>
                    <span className="ml-1">{classItem.description}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Room:</span>
                    <span className="ml-1">{classItem.room || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {classItem.current_students || 0}/{classItem.capacity} students
                    </span>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <div className="pt-3 border-t border-gray-200">
                    <ClassEnrollmentDialog 
                      classId={classItem.id} 
                      className={classItem.name}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;
