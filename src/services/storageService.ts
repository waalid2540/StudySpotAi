/**
 * Local Storage Service
 * Provides persistent data storage with type safety and error handling
 */

class StorageService {
  private prefix = 'learninghub_';

  /**
   * Save data to localStorage
   */
  set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all app data from localStorage
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * Get all keys with prefix
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          size += key.length + item.length;
        }
      }
    }
    return size;
  }

  /**
   * Get storage size in human-readable format
   */
  getSizeFormatted(): string {
    const bytes = this.getSize();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Specific data methods for the app

  /**
   * Save user homework submissions
   */
  saveHomework(userId: string, homework: any[]): boolean {
    return this.set(`homework_${userId}`, homework);
  }

  /**
   * Get user homework submissions
   */
  getHomework(userId: string): any[] {
    return this.get(`homework_${userId}`, []);
  }

  /**
   * Save quiz results
   */
  saveQuizResults(userId: string, results: any[]): boolean {
    return this.set(`quiz_results_${userId}`, results);
  }

  /**
   * Get quiz results
   */
  getQuizResults(userId: string): any[] {
    return this.get(`quiz_results_${userId}`, []);
  }

  /**
   * Save user stats
   */
  saveUserStats(userId: string, stats: any): boolean {
    return this.set(`stats_${userId}`, stats);
  }

  /**
   * Get user stats
   */
  getUserStats(userId: string): any {
    return this.get(`stats_${userId}`, {
      homeworkCompleted: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      totalPoints: 0,
      studyTime: 0,
      streak: 0,
      achievements: [],
    });
  }

  /**
   * Update user stats incrementally
   */
  updateUserStats(userId: string, updates: Partial<any>): boolean {
    const currentStats = this.getUserStats(userId);
    const updatedStats = { ...currentStats, ...updates };
    return this.saveUserStats(userId, updatedStats);
  }

  /**
   * Save achievements
   */
  saveAchievements(userId: string, achievements: any[]): boolean {
    return this.set(`achievements_${userId}`, achievements);
  }

  /**
   * Get achievements
   */
  getAchievements(userId: string): any[] {
    return this.get(`achievements_${userId}`, []);
  }

  /**
   * Add new achievement
   */
  addAchievement(userId: string, achievement: any): boolean {
    const achievements = this.getAchievements(userId);
    achievements.push(achievement);
    return this.saveAchievements(userId, achievements);
  }

  /**
   * Save study sessions
   */
  saveStudySessions(userId: string, sessions: any[]): boolean {
    return this.set(`study_sessions_${userId}`, sessions);
  }

  /**
   * Get study sessions
   */
  getStudySessions(userId: string): any[] {
    return this.get(`study_sessions_${userId}`, []);
  }

  /**
   * Add study session
   */
  addStudySession(userId: string, session: any): boolean {
    const sessions = this.getStudySessions(userId);
    sessions.push(session);
    return this.saveStudySessions(userId, sessions);
  }

  /**
   * Save user preferences
   */
  savePreferences(userId: string, preferences: any): boolean {
    return this.set(`preferences_${userId}`, preferences);
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): any {
    return this.get(`preferences_${userId}`, {
      notifications: true,
      emailUpdates: true,
      theme: 'light',
      language: 'en',
    });
  }

  /**
   * Save notifications
   */
  saveNotifications(userId: string, notifications: any[]): boolean {
    return this.set(`notifications_${userId}`, notifications);
  }

  /**
   * Get notifications
   */
  getNotifications(userId: string): any[] {
    return this.get(`notifications_${userId}`, []);
  }

  /**
   * Add notification
   */
  addNotification(userId: string, notification: any): boolean {
    const notifications = this.getNotifications(userId);
    notifications.unshift(notification); // Add to beginning
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    return this.saveNotifications(userId, notifications);
  }

  /**
   * Clear user data (for logout)
   */
  clearUserData(userId: string): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach((key) => {
        if (key.includes(userId)) {
          this.remove(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
