import { Request, Response } from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<any> {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Only allow student and parent roles via registration
      // Admins must be appointed via CLI/terminal
      if (!['student', 'parent'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Only student and parent roles can be registered.' });
      }

      // Create Firebase user
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Set custom claims for role
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });

      // Create JWT token
      const token = jwt.sign(
        {
          uid: userRecord.uid,
          email: userRecord.email,
          role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: userRecord.uid,
          email: userRecord.email,
          firstName,
          lastName,
          role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<any> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'ID token is required' });
      }

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const user = await admin.auth().getUser(decodedToken.uid);

      // Get custom claims (role)
      const customClaims = user.customClaims || {};
      const role = customClaims.role || 'student';

      // Create JWT token
      const token = jwt.sign(
        {
          uid: user.uid,
          email: user.email,
          role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: any, res: Response): Promise<any> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await admin.auth().getUser(userId);
      const customClaims = user.customClaims || {};

      res.json({
        user: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: customClaims.role || 'student',
        },
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: error.message || 'Failed to get profile' });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: any, res: Response): Promise<any> {
    try {
      const userId = req.user?.uid;
      const { displayName, photoURL } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await admin.auth().updateUser(userId, {
        displayName,
        photoURL,
      });

      res.json({
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  }
}

export const authController = new AuthController();
