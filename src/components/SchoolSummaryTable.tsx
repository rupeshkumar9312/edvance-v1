
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const SchoolSummaryTable = () => {
  const { schoolSummary, loadingSchoolSummary } = useSuperAdmin();

  if (loadingSchoolSummary) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">School-wise Summary</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Teachers</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolSummary.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.school_name}</TableCell>
                <TableCell>{school.school_code}</TableCell>
                <TableCell>{school.principal_name || 'Not assigned'}</TableCell>
                <TableCell>{school.student_count}</TableCell>
                <TableCell>{school.teacher_count}</TableCell>
                <TableCell>{school.class_count}</TableCell>
                <TableCell>${(school.total_revenue / 100).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                    {school.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {schoolSummary.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No schools found</p>
        </div>
      )}
    </div>
  );
};

export default SchoolSummaryTable;
