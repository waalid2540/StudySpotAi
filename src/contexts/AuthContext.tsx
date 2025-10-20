import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, isDemoMode } from '../config/firebase';
import authService from '../services/authService';
import { AuthContextType, RegisterData, LoginData, User } from '../types/auth';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    // Check if in demo mode
    if (isDemoMode) {
      console.warn('🎭 Demo mode active - checking localStorage for auth');
      // Check localStorage for demo mode auth
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const storedEmail = localStorage.getItem('userEmail') || 'demo@example.com';
        const storedRole = localStorage.getItem('userRole') || 'student';
        const storedName = localStorage.getItem('userName') || 'Demo User';

        setUser({
          id: 'demo-user-id',
          email: storedEmail,
          displayName: storedName,
          photoURL: null,
          role: storedRole as any,
          emailVerified: true,
          createdAt: new Date(),
        });
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user profile from backend
          const response = await authAPI.getProfile();
          const userData = response.data;

          setUser({
            id: userData.id,
            email: userData.email,
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            role: userData.role,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(userData.createdAt),
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If we can't fetch the profile, use Firebase data
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: (localStorage.getItem('userRole') as any) || 'student',
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      // Demo mode registration (no Firebase)
      if (isDemoMode) {
        console.warn('🎭 DEMO MODE: Registering without Firebase');
        const mockToken = btoa(JSON.stringify({
          email: data.email,
          userId: 'demo-' + Date.now(),
          role: data.role,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));

        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
        localStorage.setItem('userRole', data.role);

        setUser({
          id: 'demo-' + Date.now(),
          email: data.email,
          displayName: `${data.firstName} ${data.lastName}`,
          photoURL: null,
          role: data.role,
          emailVerified: true,
          createdAt: new Date(),
        });
        return;
      }

      await authService.register(data);
      // The onAuthStateChanged listener will update the user state
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      // Demo mode login (no Firebase)
      if (isDemoMode) {
        console.warn('🎭 DEMO MODE: Logging in without Firebase');

        // Check for admin credentials
        let role: 'student' | 'parent' | 'admin' = 'student';
        let displayName = data.email.split('@')[0];
        let userId = 'demo-user-123';

        if (data.email === 'admin@learninghub.com' && data.password === 'admin123') {
          role = 'admin';
          displayName = 'Admin User';
          userId = 'admin-001';
          console.log('🔐 Admin logged in!');
        } else if (data.email === 'parent@demo.com' && data.password === 'parent123') {
          role = 'parent';
          displayName = 'Parent User';
          userId = 'parent-001';
          console.log('👨‍👩‍👧 Parent logged in!');
        } else if (data.email === 'student@demo.com' && data.password === 'student123') {
          role = 'student';
          displayName = 'Student User';
          userId = 'student-001';
          console.log('🎓 Student logged in!');
        }

        const mockToken = btoa(JSON.stringify({
          email: data.email,
          userId: userId,
          role: role,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));

        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', displayName);
        localStorage.setItem('userRole', role);

        setUser({
          id: userId,
          email: data.email,
          displayName: displayName,
          photoURL: null,
          role: role,
          emailVerified: true,
          createdAt: new Date(),
        });
        return;
      }

      await authService.login(data);
      // The onAuthStateChanged listener will update the user state
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);

      // Demo mode logout
      if (isDemoMode) {
        console.warn('🎭 DEMO MODE: Logging out without Firebase');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setUser(null);
        setFirebaseUser(null);
        return;
      }

      await authService.logout();
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (
    displayName: string,
    photoURL?: string
  ): Promise<void> => {
    try {
      setError(null);
      await authService.updateUserProfile(displayName, photoURL);

      // Update local user state
      if (user) {
        setUser({
          ...user,
          displayName,
          ...(photoURL && { photoURL }),
        });
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
