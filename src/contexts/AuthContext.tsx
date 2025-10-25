import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService from '../services/authService';
import { AuthContextType, RegisterData, LoginData, User } from '../types/auth';
import { userTrackingService } from '../services/userTracking';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth session on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const userId = localStorage.getItem('userId') || '';
      const email = localStorage.getItem('userEmail') || '';
      const displayName = localStorage.getItem('userName') || '';
      const role = (localStorage.getItem('userRole') as any) || 'student';

      const currentUser: User = {
        id: userId,
        uid: userId,
        email,
        displayName,
        photoURL: null,
        role,
        emailVerified: true,
        createdAt: new Date(),
      };

      setUser(currentUser);

      // Track user as online
      userTrackingService.userLoggedIn({
        id: userId,
        name: displayName || email,
        email,
        role,
      });
    }
    setLoading(false);
  }, []);

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const user = await authService.register(data);

      const newUser: User = {
        id: user.id,
        uid: user.id,
        email: user.email,
        displayName: user.displayName || `${data.firstName} ${data.lastName}`,
        photoURL: null,
        role: user.role,
        emailVerified: true,
        createdAt: new Date(),
      };

      setUser(newUser);

      // Track new user as online
      userTrackingService.userLoggedIn({
        id: newUser.id,
        name: newUser.displayName || newUser.email,
        email: newUser.email,
        role: newUser.role,
      });
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

      const user = await authService.login(data);

      const loggedInUser: User = {
        id: user.id,
        uid: user.id,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: null,
        role: user.role,
        emailVerified: true,
        createdAt: new Date(),
      };

      setUser(loggedInUser);

      // Track user as online
      userTrackingService.userLoggedIn({
        id: loggedInUser.id,
        name: loggedInUser.displayName || loggedInUser.email,
        email: loggedInUser.email,
        role: loggedInUser.role,
      });
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

      // Track user logout before clearing user state
      if (user) {
        userTrackingService.userLoggedOut(user.id);
      }

      await authService.logout();
      setUser(null);
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
    firebaseUser: null, // Not using Firebase
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
