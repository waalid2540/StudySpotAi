type MessageHandler = (data: any) => void;
type EventType =
  | 'notification'
  | 'message'
  | 'user_status'
  | 'activity'
  | 'homework_update'
  | 'quiz_update'
  | 'achievement'
  | 'connection'
  | 'error';

interface WebSocketMessage {
  type: EventType;
  payload: any;
  timestamp: number;
  userId?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<EventType, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private url: string;
  private userId: string | null = null;

  constructor() {
    // For development, use a mock WebSocket URL
    // In production, this would be your actual WebSocket server URL
    this.url = this.getMockWebSocketUrl();
  }

  private getMockWebSocketUrl(): string {
    // Check if there's a real WebSocket server
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (wsUrl) {
      return wsUrl;
    }

    // Otherwise, we'll simulate WebSocket behavior
    // This returns a special protocol that we'll handle
    return 'mock://localhost:3000/ws';
  }

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.userId = userId;
      this.isConnecting = true;

      // If using mock WebSocket, simulate connection
      if (this.url.startsWith('mock://')) {
        this.simulateMockWebSocket();
        this.isConnecting = false;
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // Send authentication message
          this.send('connection', { userId, action: 'connect' });

          this.emit('connection', { status: 'connected', userId });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { error: 'WebSocket connection error' });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.isConnecting = false;
          this.ws = null;
          this.emit('connection', { status: 'disconnected' });
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private simulateMockWebSocket(): void {
    console.log('Using mock WebSocket for development');

    // Simulate connection
    this.emit('connection', { status: 'connected', userId: this.userId, mock: true });

    // Simulate some real-time events for testing
    this.startMockEventSimulation();
  }

  private startMockEventSimulation(): void {
    // Simulate random notifications every 30 seconds
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.emit('notification', {
          id: Date.now().toString(),
          title: 'New Update',
          message: 'You have a new notification!',
          type: 'info',
          timestamp: Date.now(),
        });
      }
    }, 30000);

    // Simulate user status changes
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.emit('user_status', {
          userId: 'mock_user_' + Math.floor(Math.random() * 100),
          status: Math.random() > 0.5 ? 'online' : 'offline',
          timestamp: Date.now(),
        });
      }
    }, 15000);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.send('connection', { userId: this.userId, action: 'disconnect' });
      this.ws.close();
      this.ws = null;
    }

    this.emit('connection', { status: 'disconnected' });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('error', { error: 'Failed to reconnect after multiple attempts' });
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Attempting to reconnect in ${delay}ms...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;

      if (this.userId) {
        this.connect(this.userId).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  send(type: EventType, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      userId: this.userId || undefined,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else if (this.url.startsWith('mock://')) {
      // In mock mode, immediately echo back certain messages
      if (type === 'message') {
        setTimeout(() => {
          this.emit('message', {
            ...payload,
            id: Date.now().toString(),
            timestamp: Date.now(),
            status: 'sent',
          });
        }, 100);
      }
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(type: EventType, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(type, handler);
    };
  }

  off(type: EventType, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(type: EventType, payload: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in ${type} handler:`, error);
        }
      });
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    this.emit(message.type, message.payload);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.url.startsWith('mock://');
  }

  getConnectionState(): string {
    if (this.url.startsWith('mock://')) {
      return 'mock';
    }

    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Helper methods for specific event types
  sendNotification(notification: any): void {
    this.send('notification', notification);
  }

  sendMessage(message: any): void {
    this.send('message', message);
  }

  updateUserStatus(status: 'online' | 'away' | 'offline'): void {
    this.send('user_status', { userId: this.userId, status });
  }

  sendActivity(activity: any): void {
    this.send('activity', activity);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export type { WebSocketMessage, EventType, MessageHandler };
