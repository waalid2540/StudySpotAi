import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { websocketService, type EventType, type MessageHandler } from '../services/websocket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  send: (type: EventType, payload: any) => void;
  subscribe: (type: EventType, handler: MessageHandler) => () => void;
  sendNotification: (notification: any) => void;
  sendMessage: (message: any) => void;
  updateUserStatus: (status: 'online' | 'away' | 'offline') => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    // Connect to WebSocket when user logs in
    console.log('Connecting to WebSocket...');
    websocketService
      .connect(user.uid)
      .then(() => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        updateConnectionState();
      })
      .catch((error) => {
        console.error('Failed to connect to WebSocket:', error);
        toast.error('Failed to establish real-time connection');
      });

    // Subscribe to connection events
    const unsubscribeConnection = websocketService.on('connection', (data) => {
      console.log('Connection event:', data);
      setIsConnected(data.status === 'connected');
      updateConnectionState();

      if (data.status === 'connected') {
        if (data.mock) {
          toast.success('Real-time features enabled (Mock Mode)', { duration: 2000 });
        } else {
          toast.success('Real-time connection established');
        }
      } else if (data.status === 'disconnected') {
        toast.error('Real-time connection lost');
      }
    });

    // Subscribe to error events
    const unsubscribeError = websocketService.on('error', (data) => {
      console.error('WebSocket error:', data);
      toast.error(data.error || 'Real-time connection error');
    });

    // Update user status to online
    websocketService.updateUserStatus('online');

    // Track user activity for status updates
    let activityTimer: NodeJS.Timeout;
    const resetActivityTimer = () => {
      clearTimeout(activityTimer);
      websocketService.updateUserStatus('online');

      // Set to away after 2 minutes of inactivity
      activityTimer = setTimeout(() => {
        websocketService.updateUserStatus('away');
      }, 2 * 60 * 1000);
    };

    // Listen for user activity
    window.addEventListener('mousemove', resetActivityTimer);
    window.addEventListener('keydown', resetActivityTimer);
    window.addEventListener('click', resetActivityTimer);

    resetActivityTimer();

    // Cleanup on unmount or user logout
    return () => {
      clearTimeout(activityTimer);
      window.removeEventListener('mousemove', resetActivityTimer);
      window.removeEventListener('keydown', resetActivityTimer);
      window.removeEventListener('click', resetActivityTimer);

      unsubscribeConnection();
      unsubscribeError();

      websocketService.updateUserStatus('offline');
      websocketService.disconnect();
      setIsConnected(false);
      setConnectionState('disconnected');
    };
  }, [user?.uid]);

  const updateConnectionState = () => {
    setConnectionState(websocketService.getConnectionState());
  };

  const send = (type: EventType, payload: any) => {
    websocketService.send(type, payload);
  };

  const subscribe = (type: EventType, handler: MessageHandler) => {
    return websocketService.on(type, handler);
  };

  const sendNotification = (notification: any) => {
    websocketService.sendNotification(notification);
  };

  const sendMessage = (message: any) => {
    websocketService.sendMessage(message);
  };

  const updateUserStatus = (status: 'online' | 'away' | 'offline') => {
    websocketService.updateUserStatus(status);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    send,
    subscribe,
    sendNotification,
    sendMessage,
    updateUserStatus,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
