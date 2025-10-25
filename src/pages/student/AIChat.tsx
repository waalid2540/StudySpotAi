import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import { Send, Bot, User, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { TutorCharacter, PERSONALITY_TRAITS } from '../../types/tutorCharacter';
import { TutorCharacterPreview } from '../../components/TutorCharacterPreview';
import { TutorCharacterBuilder } from '../../components/TutorCharacterBuilder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: 'happy' | 'thinking' | 'excited' | 'proud';
}

const AIChat = () => {
  // Load saved character or use default
  const [tutorCharacter, setTutorCharacter] = useState<TutorCharacter>(() => {
    const saved = localStorage.getItem('tutorCharacter');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, createdAt: new Date(parsed.createdAt) };
    }
    // Default character
    return {
      id: 'default',
      name: 'Buddy',
      personality: 'friend',
      appearance: {
        bodyType: 'round',
        skinColor: '#FBBF24',
        eyeStyle: 'sparkle',
        mouthStyle: 'smile',
        accessory: 'none',
        primaryColor: '#60A5FA',
        secondaryColor: '#A78BFA',
      },
      createdAt: new Date(),
    };
  });

  const [showCharacterSettings, setShowCharacterSettings] = useState(false);
  const personality = PERSONALITY_TRAITS[tutorCharacter.personality];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: personality.greetings[Math.floor(Math.random() * personality.greetings.length)],
      timestamp: new Date(),
      emotion: 'happy',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.chat(input, sessionId);
      let aiContent = response.data.message || 'I apologize, but I couldn\'t process that request.';

      // Add personality flair to the response
      const emotion = Math.random() > 0.7 ? 'excited' : 'happy';

      const aiMessage: Message = {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        emotion,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI tutor');
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        emotion: 'happy',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    'Help me solve this math problem: 2x + 5 = 15',
    'Explain photosynthesis in simple terms',
    'How do I write a good essay introduction?',
    'What is the Pythagorean theorem?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white p-6 rounded-t-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-2">
              <TutorCharacterPreview
                appearance={tutorCharacter.appearance}
                emotion="happy"
                animate={false}
                size="small"
                aiImageUrl={tutorCharacter.useAIImage ? tutorCharacter.aiGeneratedImage : undefined}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tutorCharacter.name}</h1>
              <p className="text-sm opacity-90">
                {personality.icon} {personality.name} • Ready to help!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCharacterSettings(!showCharacterSettings)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Customize your tutor"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white dark:bg-gray-900 p-6 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {message.role === 'user' ? (
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary-600">
                <User className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <TutorCharacterPreview
                  appearance={tutorCharacter.appearance}
                  emotion={message.emotion || 'happy'}
                  animate={index === messages.length - 1}
                  size="small"
                  aiImageUrl={tutorCharacter.useAIImage ? tutorCharacter.aiGeneratedImage : undefined}
                />
              </div>
            )}
            <div
              className={`flex-1 max-w-2xl ${
                message.role === 'user' ? 'text-right' : ''
              }`}
            >
              <div
                className={`inline-block p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <TutorCharacterPreview
                appearance={tutorCharacter.appearance}
                emotion="thinking"
                animate={true}
                size="small"
                aiImageUrl={tutorCharacter.useAIImage ? tutorCharacter.aiGeneratedImage : undefined}
              />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example Questions */}
      {messages.length === 1 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-left text-sm p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-xl"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your homework..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • AI-powered by Claude
        </p>
      </form>

      {/* Character Customization Modal */}
      {showCharacterSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customize Your AI Tutor
                </h2>
                <button
                  onClick={() => setShowCharacterSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <TutorCharacterBuilder
                initialCharacter={tutorCharacter}
                onSave={(character) => {
                  setTutorCharacter(character);
                  localStorage.setItem('tutorCharacter', JSON.stringify(character));
                  setShowCharacterSettings(false);

                  // Update greeting message
                  const newPersonality = PERSONALITY_TRAITS[character.personality];
                  setMessages([{
                    role: 'assistant',
                    content: newPersonality.greetings[Math.floor(Math.random() * newPersonality.greetings.length)],
                    timestamp: new Date(),
                    emotion: 'happy',
                  }]);

                  toast.success(`${character.name} is now your tutor!`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
