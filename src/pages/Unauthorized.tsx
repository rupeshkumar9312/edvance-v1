
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Please contact your administrator if you believe you should have access to this resource.
          </p>
          <div className="space-y-2">
            <Link to="/">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="w-full">Sign Out & Login with Different Account</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
