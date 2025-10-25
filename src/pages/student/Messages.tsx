import { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  User,
  Mail,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { messagingAPI } from '../../services/api';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const StudentMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  // Parent info (hardcoded for demo)
  const parent = {
    id: 'parent-1',
    name: 'Mom/Dad',
    role: 'parent',
  };

  // Load messages on mount and set up polling
  useEffect(() => {
    loadMessages();
    loadUnreadCount();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages();
      loadUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagingAPI.getMessages(parent.id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await messagingAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await messagingAPI.sendMessage(
        parent.id,
        messageText,
        parent.name,
        parent.role
      );

      // Reload messages
      await loadMessages();

      setMessageText('');
      toast.success('Message sent to your parent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleConnectParent = () => {
    if (!parentEmail.trim()) {
      toast.error('Please enter your parent\'s email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // In demo mode, just save to localStorage
    localStorage.setItem('parent_email', parentEmail);

    toast.success(`Connection request sent to ${parentEmail}!`);
    setShowConnectModal(false);
    setParentEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chat with your parents
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 px-4 py-2 text-primary-700 dark:text-primary-300">
              <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Connect Parent
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-md overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {getInitials(parent.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {parent.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              Your parent
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Send a message to start chatting with your parent
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isSent = message.senderId === 'current-user';
              return (
                <div
                  key={message.id}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isSent
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {!isSent && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        isSent
                          ? 'text-primary-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      {isSent && (
                        <>
                          {message.read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message to your parent..."
                rows={1}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>

      {/* Connect Parent Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Connect with Parent
              </h2>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setParentEmail('');
                }}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Invite your parent to connect
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    They'll receive an email to join and chat with you
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent's Email Address
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConnectParent();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  We'll send them an invitation to join the platform
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setParentEmail('');
                }}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectParent}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMessages;
