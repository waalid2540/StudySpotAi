import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // Only allow student and parent roles via registration
      // Admins must be appointed via CLI/terminal
      if (!['student', 'parent'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Only student and parent roles can be registered.' });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Generate email verification token
      const email_verification_token = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = userRepository.create({
        email,
        password_hash,
        first_name: firstName,
        last_name: lastName,
        role: role as UserRole,
        email_verification_token,
        email_verified: false,
      });

      await userRepository.save(user);

      // Create JWT tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
        },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          emailVerified: user.email_verified,
        },
        accessToken,
        refreshToken,
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
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Find user with password
      const user = await userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .addSelect('user.password_hash')
        .getOne();

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      // Update last login
      user.last_login_at = new Date();
      await userRepository.save(user);

      // Create JWT tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
        },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          displayName: `${user.first_name} ${user.last_name}`,
          role: user.role,
          emailVerified: user.email_verified,
        },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: any, res: Response): Promise<any> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          displayName: `${user.first_name} ${user.last_name}`,
          photoURL: user.profile_picture_url,
          role: user.role,
          emailVerified: user.email_verified,
          timezone: user.timezone,
          dateOfBirth: user.date_of_birth,
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
      const userId = req.user?.userId;
      const { firstName, lastName, photoURL, timezone, dateOfBirth } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update fields
      if (firstName) user.first_name = firstName;
      if (lastName) user.last_name = lastName;
      if (photoURL !== undefined) user.profile_picture_url = photoURL;
      if (timezone) user.timezone = timezone;
      if (dateOfBirth) user.date_of_birth = new Date(dateOfBirth);

      await userRepository.save(user);

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          photoURL: user.profile_picture_url,
          timezone: user.timezone,
        },
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<any> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.userId } });

      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Create new access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      res.json({
        accessToken,
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }
}

export const authController = new AuthController();
