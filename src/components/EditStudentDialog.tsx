import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Student } from '@/hooks/useStudents';
import { Edit, Upload, X } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';

interface EditStudentDialogProps {
  student: Student;
  onUpdate: (id: string, updates: Partial<Student>, imageFile?: File) => Promise<void>;
}

const EditStudentDialog = ({ student, onUpdate }: EditStudentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(student.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { classes, loading: classesLoading } = useClasses();
  
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    class: student.class,
    class_id: student.class_id || '',
    roll_number: student.roll_number,
    phone: student.phone || '',
    status: student.status,
    image_url: student.image_url
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    setFormData(prev => ({ 
      ...prev, 
      class_id: classId,
      class: selectedClass ? selectedClass.name : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(student.id, formData, selectedImage || undefined);
      setOpen(false);
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="image">Student Photo (Optional)</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={imagePreview}
                    alt="Student preview"
                    className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-full">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-2"
              >
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input
              value={formData.roll_number}
              disabled
              className="bg-gray-50 text-gray-600"
              title="Registration numbers cannot be changed"
            />
            <p className="text-xs text-gray-500">Registration numbers cannot be modified</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={formData.class_id} onValueChange={handleClassChange}>
              <SelectTrigger>
                <SelectValue placeholder={classesLoading ? "Loading classes..." : "Select class"} />
              </SelectTrigger>
              <SelectContent>
                {classesLoading ? (
                  <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                ) : classes.length > 0 ? (
                  classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} ({classItem.grade})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;
