import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

/**
 * Middleware to ensure admin profiles remain private
 * Prevents non-admin users from accessing admin user data
 */
export const protectAdminPrivacy = async (req: any, res: Response, next: NextFunction) => {
  try {
    const requestingUserId = req.user?.userId;
    const requestingUserRole = req.user?.role;

    // Get the user ID being accessed from params or body
    const targetUserId = req.params.userId || req.params.id || req.body.userId;

    // If no specific user is being accessed, continue
    if (!targetUserId) {
      return next();
    }

    // Admins can access any profile
    if (requestingUserRole === UserRole.ADMIN) {
      return next();
    }

    // If accessing own profile, allow
    if (requestingUserId === targetUserId) {
      return next();
    }

    // Check if target user is an admin with private profile
    const userRepository = AppDataSource.getRepository(User);
    const targetUser = await userRepository.findOne({ where: { id: targetUserId } });

    if (targetUser && targetUser.role === UserRole.ADMIN && targetUser.profile_private) {
      return res.status(403).json({
        error: 'Access denied. This profile is private.',
      });
    }

    next();
  } catch (error: any) {
    console.error('Admin privacy check error:', error);
    next(); // Continue on error to not break the app
  }
};

/**
 * Filter function to exclude admin users from query results
 * Use this when returning lists of users to non-admin users
 */
export const filterAdminUsers = (users: User[], requestingUserRole?: UserRole): User[] => {
  // Admins can see all users
  if (requestingUserRole === UserRole.ADMIN) {
    return users;
  }

  // Filter out admin users with private profiles
  return users.filter(user => {
    if (user.role === UserRole.ADMIN && user.profile_private) {
      return false;
    }
    return true;
  });
};

/**
 * Query helper to exclude admin users from database queries
 */
export const excludeAdminUsersFromQuery = (requestingUserRole?: UserRole) => {
  // Admins can query all users
  if (requestingUserRole === UserRole.ADMIN) {
    return {};
  }

  // For non-admins, exclude private admin profiles
  return {
    where: [
      { role: UserRole.STUDENT },
      { role: UserRole.PARENT },
      { role: UserRole.ADMIN, profile_private: false },
    ],
  };
};
