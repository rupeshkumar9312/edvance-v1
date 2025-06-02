
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchool } from '@/hooks/useSchool';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import logo from '../../public/logo.png'

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { schools, loadingSchools } = useSchool();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('Auth component - schools:', schools, 'loading:', loadingSchools);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Starting signin process for:', email);

    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Signin failed:', error);
      toast({
        title: "Sign In Error",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } else {
      console.log('Signin successful, navigating to dashboard');
      toast({
        title: "Success",
        description: "Welcome back!",
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Starting signup process for:', email, 'with role:', role, 'and school:', schoolId);

    const { error } = await signUp(email, password, fullName, role, schoolId || undefined);
    
    if (error) {
      console.error('Signup failed:', error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes('Database error')) {
        errorMessage = "Database error occurred. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      console.log('Signup successful');
      toast({
        title: "Success",
        description: `Account created successfully with ${role} role! Please check your email to verify your account.`,
      });
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('student');
      setSchoolId('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/*<div className="mx-auto mb-4 h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">*/}
          {/*  <GraduationCap className="h-6 w-6 text-white" />*/}
          {/*</div>*/}
          <CardTitle className="text-2xl font-bold text-blue-600 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-28 w-auto" />
          </CardTitle>
          <CardDescription>
            {/*EFFORTLESS MANAGEMENT*/}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              {/*<TabsTrigger value="signup">Sign Up</TabsTrigger>*/}
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <div className="text-center">
                  <ForgotPasswordDialog>
                    <Button variant="link" className="text-sm">
                      Forgot your password?
                    </Button>
                  </ForgotPasswordDialog>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-role">Role</Label>
                  <Select value={role} onValueChange={(value: 'admin' | 'teacher' | 'student') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="signup-school">School</Label>
                  <Select value={schoolId} onValueChange={setSchoolId} disabled={loadingSchools}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSchools ? "Loading schools..." : "Select your school"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSchools ? (
                        <SelectItem value="loading" disabled>Loading schools...</SelectItem>
                      ) : schools && schools.length > 0 ? (
                        schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name} ({school.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-schools" disabled>No schools available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading || loadingSchools}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
