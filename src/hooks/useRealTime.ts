import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface RealTimeNotification {
  id: string;
  type: 'homework' | 'achievement' | 'message' | 'alert' | 'leaderboard';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface LiveActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  type: 'homework_completed' | 'quiz_taken' | 'badge_earned' | 'login';
}

export interface OnlineUser {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

/**
 * Custom hook for real-time features
 * Simulates WebSocket connections for live updates
 * In production, this would connect to a real WebSocket server
 */
export const useRealTime = () => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setConnected(true);
      console.log('🔴 Real-time connection established');

      // Start with completely empty data
      setNotifications([]);
      setLiveActivities([]);
      setUnreadCount(0);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      setConnected(false);
      console.log('🔴 Real-time connection closed');
    };
  }, [user]);

  // Real-time notifications - disabled for now, will be triggered by actual events
  // useEffect(() => {
  //   if (!connected) return;
  //   // Notifications will be added via API calls when real events happen
  // }, [connected]);

  // Real-time activity feed - disabled for now, will populate when real users are active
  // useEffect(() => {
  //   if (!connected) return;
  //   // Activities will be added via API calls when real events happen
  // }, [connected]);

  // Online users - disabled for now, will populate when real users join
  // useEffect(() => {
  //   if (!connected) return;
  //   // Online users will be tracked via real WebSocket connections
  // }, [connected]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  return {
    connected,
    notifications,
    liveActivities,
    onlineUsers,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  };
};

// Helper functions to generate random data
function generateRandomNotification(): RealTimeNotification {
  const types: RealTimeNotification['type'][] = [
    'homework',
    'achievement',
    'message',
    'alert',
    'leaderboard',
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  const messages = {
    homework: [
      { title: 'New Homework Assigned', message: 'Math Chapter 5 homework is now available' },
      { title: 'Homework Due Soon', message: 'Science lab report is due in 2 hours' },
      { title: 'Homework Graded', message: 'Your English essay received 95%' },
    ],
    achievement: [
      { title: 'New Badge Unlocked!', message: 'You earned the "Study Streak 7 Days" badge' },
      { title: 'Level Up!', message: 'Congratulations! You reached Level 5' },
      { title: 'Top Performer', message: 'You are now in the top 10% this week!' },
    ],
    message: [
      { title: 'New Message', message: 'Your teacher replied to your question' },
      { title: 'Parent Message', message: 'Your parent sent you a message' },
      { title: 'System Update', message: 'New features are now available' },
    ],
    alert: [
      { title: 'Quiz Reminder', message: 'You have a quiz tomorrow at 9 AM' },
      { title: 'Study Session', message: 'Time for your daily study session!' },
      { title: 'Break Reminder', message: "You've been studying for 45 min, take a break!" },
    ],
    leaderboard: [
      { title: 'Leaderboard Update', message: 'Sarah Chen just passed you on the leaderboard!' },
      { title: 'New High Score', message: 'Alex Brown set a new record with 2,500 points' },
      { title: 'Rank Change', message: 'You moved up to rank #3!' },
    ],
  };

  const selectedMessages = messages[type];
  const selected = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];

  return {
    id: `notif-${Date.now()}-${Math.random()}`,
    type,
    title: selected.title,
    message: selected.message,
    timestamp: new Date(),
    read: false,
    priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
  };
}

function generateRandomActivity(): LiveActivity {
  const users = ['Sarah Chen', 'Mike Johnson', 'Emma Wilson', 'Alex Brown', 'Chris Lee'];
  const activities = [
    { action: 'completed Math homework', type: 'homework_completed' as const },
    { action: 'scored 92% on Science quiz', type: 'quiz_taken' as const },
    { action: 'earned "Quick Learner" badge', type: 'badge_earned' as const },
    { action: 'started a study session', type: 'login' as const },
    { action: 'completed English assignment', type: 'homework_completed' as const },
    { action: 'scored 88% on History quiz', type: 'quiz_taken' as const },
  ];

  const user = users[Math.floor(Math.random() * users.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];

  return {
    id: `activity-${Date.now()}-${Math.random()}`,
    userId: `user-${Math.random()}`,
    userName: user,
    action: activity.action,
    timestamp: new Date(),
    type: activity.type,
  };
}
