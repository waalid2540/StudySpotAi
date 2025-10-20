import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { RegisterData, LoginData } from '../types/auth';
import { authAPI } from './api';

class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterData): Promise<FirebaseUser> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Register user in backend
      await authAPI.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });

      // Login to backend to get auth token
      const response = await authAPI.login(idToken);
      const { token } = response.data;

      // Store auth token
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', data.role);

      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Login with email and password
   */
  async login(data: LoginData): Promise<FirebaseUser> {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Login to backend
      const response = await authAPI.login(idToken);
      const { token, user: userData } = response.data;

      // Store auth token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id);

      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Login with Google
   */
  async loginWithGoogle(): Promise<FirebaseUser> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Login to backend
      const response = await authAPI.login(idToken);
      const { token, user: userData } = response.data;

      // Store auth token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id);

      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await updateProfile(user, {
        displayName,
        ...(photoURL && { photoURL }),
      });

      // Update in backend
      await authAPI.updateProfile({ displayName, photoURL });
    } catch (error: any) {
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await sendEmailVerification(user);
    } catch (error: any) {
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser && !!localStorage.getItem('authToken');
  }

  /**
   * Get user role from localStorage
   */
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  /**
   * Get friendly error messages
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Login cancelled by user.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default new AuthService();
