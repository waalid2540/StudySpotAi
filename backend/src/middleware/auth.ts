import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { AppError } from './errorHandler';
import { UserRole } from '../entities/User';

// Initialize Firebase Admin (do this once in your app)
// Only initialize if Firebase credentials are provided
const hasFirebaseCredentials = process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY.trim() !== '' &&
  process.env.FIREBASE_CLIENT_EMAIL.trim() !== '';

if (!admin.apps.length && hasFirebaseCredentials) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role?: UserRole;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In development without Firebase, use mock authentication
    if (process.env.NODE_ENV === 'development' && !hasFirebaseCredentials) {
      console.log('[DEV MODE] Using mock authentication - Firebase not configured');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        role: 'student' as UserRole,
      };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role as UserRole,
    };

    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError('Forbidden - Insufficient permissions', 403));
    }

    next();
  };
};

// Export alias for consistency
export const authenticateUser = authenticate;
