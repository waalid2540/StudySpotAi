import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, isDemoMode } from '../config/firebase';
import authService from '../services/authService';
import { AuthContextType, RegisterData, LoginData, User } from '../types/auth';
import { authAPI } from '../services/api';
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

        const demoUser = {
          id: 'demo-user-id',
          email: storedEmail,
          displayName: storedName,
          photoURL: null,
          role: storedRole as any,
          emailVerified: true,
          createdAt: new Date(),
        };
        setUser(demoUser);

        // Track user as online
        userTrackingService.userLoggedIn({
          id: demoUser.id,
          name: demoUser.displayName || storedName,
          email: demoUser.email,
          role: demoUser.role,
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

          const currentUser = {
            id: userData.id,
            email: userData.email,
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            role: userData.role,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(userData.createdAt),
          };
          setUser(currentUser);

          // Track user as online
          userTrackingService.userLoggedIn({
            id: currentUser.id,
            name: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            role: currentUser.role,
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If we can't fetch the profile, use Firebase data
          const fallbackUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: (localStorage.getItem('userRole') as any) || 'student',
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          };
          setUser(fallbackUser);

          // Track user as online
          userTrackingService.userLoggedIn({
            id: fallbackUser.id,
            name: fallbackUser.displayName || fallbackUser.email,
            email: fallbackUser.email,
            role: fallbackUser.role,
          });
        }
      } else {
        setUser(null);
        // User logged out - remove from tracking
        if (user) {
          userTrackingService.userLoggedOut(user.id);
        }
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

        // Get existing registered users
        const registeredUsers = JSON.parse(localStorage.getItem('learninghub_registered_users') || '[]');

        // Check if email already exists
        if (registeredUsers.find((u: any) => u.email === data.email)) {
          throw new Error('This email is already registered. Please login instead.');
        }

        // Create new user object
        const newUser = {
          id: 'demo-' + Date.now(),
          email: data.email,
          password: data.password, // Store password for demo mode authentication
          displayName: `${data.firstName} ${data.lastName}`,
          photoURL: null,
          role: data.role,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        // Add to registered users list
        registeredUsers.push(newUser);
        localStorage.setItem('learninghub_registered_users', JSON.stringify(registeredUsers));

        // Create session
        const mockToken = btoa(JSON.stringify({
          email: newUser.email,
          userId: newUser.id,
          role: newUser.role,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));

        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userEmail', newUser.email);
        localStorage.setItem('userName', newUser.displayName);
        localStorage.setItem('userRole', newUser.role);

        setUser({
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          photoURL: null,
          role: newUser.role,
          emailVerified: true,
          createdAt: new Date(newUser.createdAt),
        });

        // Track new user as online
        userTrackingService.userLoggedIn({
          id: newUser.id,
          name: newUser.displayName || newUser.email,
          email: newUser.email,
          role: newUser.role,
        });

        console.log(`✅ New ${newUser.role.toUpperCase()} registered: ${newUser.displayName}`);
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

        // Get registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('learninghub_registered_users') || '[]');

        // Find user by email
        const foundUser = registeredUsers.find((u: any) => u.email === data.email);

        if (!foundUser) {
          throw new Error('No account found with this email. Please register first.');
        }

        // Validate password
        if (foundUser.password !== data.password) {
          throw new Error('Incorrect password. Please try again.');
        }

        // User authenticated successfully
        const mockToken = btoa(JSON.stringify({
          email: foundUser.email,
          userId: foundUser.id,
          role: foundUser.role,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));

        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userEmail', foundUser.email);
        localStorage.setItem('userName', foundUser.displayName);
        localStorage.setItem('userRole', foundUser.role);

        setUser({
          id: foundUser.id,
          email: foundUser.email,
          displayName: foundUser.displayName,
          photoURL: null,
          role: foundUser.role,
          emailVerified: true,
          createdAt: new Date(foundUser.createdAt),
        });

        // Track user as online
        userTrackingService.userLoggedIn({
          id: foundUser.id,
          name: foundUser.displayName,
          email: foundUser.email,
          role: foundUser.role,
        });

        console.log(`✅ ${foundUser.role.toUpperCase()} logged in: ${foundUser.displayName}`);
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

      // Track user logout before clearing user state
      if (user) {
        userTrackingService.userLoggedOut(user.id);
      }

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
