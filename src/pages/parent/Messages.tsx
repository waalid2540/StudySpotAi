import { useState, useEffect } from 'react';
import {
  Send,
  Search,
  User,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  PlusCircle,
  X,
  Paperclip,
  Smile,
  Mail,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { messagingAPI, parentAPI } from '../../services/api';

interface Child {
  id: string;
  name: string;
  email: string;
  grade: string;
  avatar?: string;
}

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

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

const ParentMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [childEmail, setChildEmail] = useState('');

  // Load children and conversations, and set up polling
  useEffect(() => {
    loadData();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load children
      const childrenResponse = await parentAPI.getChildren();
      const childrenData = childrenResponse.data.children;
      setChildren(childrenData);

      // Load conversations
      const conversationsResponse = await messagingAPI.getConversations();
      const conversationsData = conversationsResponse.data.conversations;
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await messagingAPI.sendMessage(
        selectedConversation.userId,
        messageText,
        selectedConversation.userName,
        selectedConversation.userRole
      );

      // Reload messages
      const messagesResponse = await messagingAPI.getMessages(selectedConversation.userId);
      const messages = messagesResponse.data.messages;

      // Update selected conversation
      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              messages,
              lastMessage: messageText,
              timestamp: 'Just now',
            }
          : null
      );

      // Reload conversations
      await loadData();

      setMessageText('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    try {
      // Load messages for this conversation
      const messagesResponse = await messagingAPI.getMessages(conversation.userId);
      const messages = messagesResponse.data.messages;

      setSelectedConversation({
        ...conversation,
        messages,
      });

      // Mark messages as read
      for (const msg of messages) {
        if (!msg.read && msg.senderId !== 'current-user') {
          await messagingAPI.markAsRead(msg.id);
        }
      }

      // Reload conversations to update unread count
      await loadData();
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnectChild = () => {
    if (!childEmail.trim()) {
      toast.error('Please enter your child\'s email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(childEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // In demo mode, just save to localStorage
    const existingChildren = JSON.parse(localStorage.getItem('connected_children') || '[]');
    existingChildren.push(childEmail);
    localStorage.setItem('connected_children', JSON.stringify(existingChildren));

    toast.success(`Connection request sent to ${childEmail}!`);
    setShowConnectModal(false);
    setChildEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Communicate with your children
          </p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Connect Child
        </button>
      </div>

      {/* Messages Container */}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 rounded-xl bg-white dark:bg-gray-800 shadow-md overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 pr-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Your children haven't sent any messages yet
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 text-left transition-colors ${
                    selectedConversation?.userId === conv.userId
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(conv.userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conv.userName}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 h-5 w-5 rounded-full bg-primary-600 text-xs text-white flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {conv.userRole}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {conv.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-gray-800 shadow-md overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {getInitials(selectedConversation.userName)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.userName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {selectedConversation.userRole}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  </div>
                ) : (
                  selectedConversation.messages.map((message) => {
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
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
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
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                    <Smile className="h-5 w-5" />
                  </button>
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your child from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connect Child Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Connect with Child
              </h2>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setChildEmail('');
                }}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Invite your child to connect
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    They'll receive an email to join and chat with you
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child's Email Address
                </label>
                <input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="child@example.com"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConnectChild();
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
                  setChildEmail('');
                }}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectChild}
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

export default ParentMessages;
