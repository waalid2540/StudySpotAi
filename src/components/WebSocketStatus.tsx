import { useWebSocket } from '../contexts/WebSocketContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const WebSocketStatus = () => {
  const { isConnected, connectionState } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
      case 'mock':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
      case 'mock':
        return <Wifi className="h-3 w-3" />;
      case 'connecting':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'mock':
        return 'Mock Mode';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-50 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2"
      title={`WebSocket Status: ${getStatusText()}`}
    >
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
      </span>
    </div>
  );
};

export default WebSocketStatus;
