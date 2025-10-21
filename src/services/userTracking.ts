// Real-time user tracking service
// Tracks actual logged-in users and their activity

interface TrackedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  loginTime: Date;
}

class UserTrackingService {
  private static instance: UserTrackingService;
  private onlineUsers: Map<string, TrackedUser> = new Map();
  private activityListeners: Set<(users: TrackedUser[]) => void> = new Set();
  private heartbeatInterval?: NodeJS.Timeout;

  private constructor() {
    // Start heartbeat to clean up inactive users
    this.startHeartbeat();
  }

  static getInstance(): UserTrackingService {
    if (!UserTrackingService.instance) {
      UserTrackingService.instance = new UserTrackingService();
    }
    return UserTrackingService.instance;
  }

  // Called when user logs in
  userLoggedIn(user: { id: string; name: string; email: string; role: string }) {
    const trackedUser: TrackedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      status: 'online',
      lastSeen: new Date(),
      currentPage: window.location.pathname,
      loginTime: new Date(),
    };

    this.onlineUsers.set(user.id, trackedUser);
    this.notifyListeners();

    // Track page changes
    this.trackPageChanges(user.id);
  }

  // Called when user logs out
  userLoggedOut(userId: string) {
    this.onlineUsers.delete(userId);
    this.notifyListeners();
  }

  // Update user activity
  updateUserActivity(userId: string) {
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.lastSeen = new Date();
      user.status = 'online';
      user.currentPage = window.location.pathname;
      this.onlineUsers.set(userId, user);
      this.notifyListeners();
    }
  }

  // Track page changes for a user
  private trackPageChanges(userId: string) {
    // Listen to route changes
    const updatePage = () => {
      const user = this.onlineUsers.get(userId);
      if (user) {
        user.currentPage = window.location.pathname;
        user.lastSeen = new Date();
        this.onlineUsers.set(userId, user);
        this.notifyListeners();
      }
    };

    // Track navigation
    window.addEventListener('popstate', updatePage);

    // Also track on activity (mouse move, click, etc.)
    const activityHandler = () => {
      this.updateUserActivity(userId);
    };

    window.addEventListener('mousemove', activityHandler, { passive: true });
    window.addEventListener('click', activityHandler, { passive: true });
    window.addEventListener('keypress', activityHandler, { passive: true });
  }

  // Get all online users
  getOnlineUsers(): TrackedUser[] {
    return Array.from(this.onlineUsers.values());
  }

  // Subscribe to user updates
  subscribe(listener: (users: TrackedUser[]) => void) {
    this.activityListeners.add(listener);
    // Immediately send current state
    listener(this.getOnlineUsers());

    return () => {
      this.activityListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const users = this.getOnlineUsers();
    this.activityListeners.forEach(listener => listener(users));
  }

  // Heartbeat to mark users as away/offline
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      let changed = false;

      this.onlineUsers.forEach((user, userId) => {
        const timeSinceActivity = now.getTime() - user.lastSeen.getTime();

        // Mark as away after 2 minutes of inactivity
        if (timeSinceActivity > 2 * 60 * 1000 && user.status === 'online') {
          user.status = 'away';
          changed = true;
        }

        // Remove after 10 minutes of inactivity
        if (timeSinceActivity > 10 * 60 * 1000) {
          this.onlineUsers.delete(userId);
          changed = true;
        }
      });

      if (changed) {
        this.notifyListeners();
      }
    }, 30000); // Check every 30 seconds
  }

  // Clean up
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.onlineUsers.clear();
    this.activityListeners.clear();
  }
}

export const userTrackingService = UserTrackingService.getInstance();
