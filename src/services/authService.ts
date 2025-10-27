import { authAPI } from './api';
import { RegisterData, LoginData } from '../types/auth';

/**
 * Authentication Service - Backend API Only (PostgreSQL + JWT)
 * No Firebase - uses your backend at https://studyspot-ai-backend.onrender.com
 */
class AuthService {
  /**
   * Register a new user via backend API
   */
  async register(data: RegisterData): Promise<any> {
    try {
      const response = await authAPI.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });

      // Store token and user data from backend
      const { accessToken, user } = response.data;
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || `${data.firstName} ${data.lastName}`);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);

      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Login user via backend API
   */
  async login(data: LoginData): Promise<any> {
    try {
      const response = await authAPI.login(data.email, data.password);

      // Store token and user data from backend
      const { accessToken, user } = response.data;
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || user.email);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);

      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  /**
   * Request password reset code
   */
  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data.resetCode; // Returns 6-digit code
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to request reset code';
      throw new Error(errorMessage);
    }
  }

  /**
   * Reset password with code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await authAPI.resetPassword(email, code, newPassword);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Password reset failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    try {
      await authAPI.updateProfile({ displayName, photoURL });
      localStorage.setItem('userName', displayName);
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Profile update failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    return {
      id: localStorage.getItem('userId') || '',
      email: localStorage.getItem('userEmail') || '',
      displayName: localStorage.getItem('userName') || '',
      role: localStorage.getItem('userRole') || 'student',
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get user role from localStorage
   */
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
}

export default new AuthService();
