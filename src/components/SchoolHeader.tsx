
import { useSchool } from '@/hooks/useSchool';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

const SchoolHeader = () => {
  const { userSchool, loadingUserSchool } = useSchool();

  if (loadingUserSchool) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userSchool) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">{userSchool.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-blue-700 mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {userSchool.code}
                </Badge>
                {userSchool.address && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{userSchool.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col space-y-1 text-sm text-blue-700">
            {userSchool.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{userSchool.phone}</span>
              </div>
            )}
            {userSchool.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{userSchool.email}</span>
              </div>
            )}
          </div>
        </div>
        {userSchool.principal_name && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Principal:</span> {userSchool.principal_name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolHeader;
