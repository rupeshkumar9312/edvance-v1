
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, role?: 'admin' | 'teacher' | 'student', schoolId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'teacher' | 'student' = 'student', schoolId?: string) => {
    try {
      console.log('Attempting signup for:', email, 'with role:', role, 'and school:', schoolId);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role,
            school_id: schoolId
          }
        }
      });

      console.log('Signup result:', { data, error });
      
      if (error) {
        console.error('Signup error:', error);
      } else {
        console.log('Signup successful for:', data.user?.email);
      }

      return { error };
    } catch (err) {
      console.error('Signup exception:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Signin result:', { user: data?.user?.email, error });
      
      return { error };
    } catch (err) {
      console.error('Signin exception:', err);
      return { error: err };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      console.log('Attempting password update with current password verification');
      
      if (!user?.email) {
        return { error: { message: 'User not authenticated' } };
      }

      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (verifyError) {
        console.error('Current password verification failed:', verifyError);
        return { error: { message: 'Current password is incorrect' } };
      }

      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      console.log('Password update result:', { error });
      
      return { error };
    } catch (err) {
      console.error('Password update exception:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user:', user?.email);
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      // Then call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
    } catch (err) {
      console.error('Logout exception:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      updatePassword,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
