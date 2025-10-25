import axios from 'axios';
import { UserRole } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API - Direct backend authentication (no Firebase)
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => api.post('/auth/register', data),

  login: (email: string, password: string) => api.post('/auth/login', { email, password }),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: { displayName?: string; photoURL?: string }) =>
    api.put('/auth/profile', data),

  resetPassword: (email: string) => api.post('/auth/reset-password', { email }),
};

// Check if running in demo mode (no backend)
const isDemoMode = () => {
  const token = localStorage.getItem('authToken');
  // If token exists and starts with mock pattern, we're in demo mode
  return token && token.startsWith('eyJ');
};

// Demo homework storage (persisted to localStorage)
const HOMEWORK_STORAGE_KEY = 'demo_homework';

const loadDemoHomework = (): any[] => {
  try {
    const stored = localStorage.getItem(HOMEWORK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading homework from localStorage:', error);
    return [];
  }
};

const saveDemoHomework = (homework: any[]) => {
  try {
    localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(homework));
  } catch (error) {
    console.error('Error saving homework to localStorage:', error);
  }
};

let demoHomework: any[] = loadDemoHomework();

// Homework API
export const homeworkAPI = {
  create: (data: {
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Creating homework locally');
      const newHomework = {
        id: `hw-${Date.now()}`,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      demoHomework.push(newHomework);
      saveDemoHomework(demoHomework);
      console.log('✅ Homework saved to localStorage:', newHomework);
      return Promise.resolve({ data: { homework: newHomework } });
    }
    return api.post('/homework', data);
  },

  getAll: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Loading homework from local storage');
      demoHomework = loadDemoHomework(); // Reload from localStorage
      console.log(`📚 Loaded ${demoHomework.length} homework items`);
      return Promise.resolve({ data: { homework: demoHomework } });
    }
    return api.get('/homework');
  },

  getById: (id: string) => {
    if (isDemoMode()) {
      const homework = demoHomework.find(h => h.id === id);
      return Promise.resolve({ data: { homework } });
    }
    return api.get(`/homework/${id}`);
  },

  update: (id: string, data: any) => {
    if (isDemoMode()) {
      const index = demoHomework.findIndex(h => h.id === id);
      if (index !== -1) {
        demoHomework[index] = { ...demoHomework[index], ...data };
        saveDemoHomework(demoHomework);
        console.log('✅ Homework updated in localStorage');
      }
      return Promise.resolve({ data: { homework: demoHomework[index] } });
    }
    return api.put(`/homework/${id}`, data);
  },

  complete: (id: string) => {
    if (isDemoMode()) {
      const index = demoHomework.findIndex(h => h.id === id);
      if (index !== -1) {
        demoHomework[index].status = 'completed';
        saveDemoHomework(demoHomework);

        // Award points and track completion
        homeworkCompletedCount++;
        const updatedPoints = awardPoints(20, 'Homework completed');

        console.log('✅ Homework marked as completed and saved');
        return Promise.resolve({
          data: {
            homework: demoHomework[index],
            points: 20,
            totalPoints: updatedPoints.totalPoints,
            level: updatedPoints.level,
            badgeUnlocked: homeworkCompletedCount === 1 || homeworkCompletedCount === 5 || homeworkCompletedCount === 10
          }
        });
      }
      return Promise.resolve({ data: { homework: demoHomework[index], points: 20 } });
    }
    return api.post(`/homework/${id}/complete`);
  },

  delete: (id: string) => {
    if (isDemoMode()) {
      demoHomework = demoHomework.filter(h => h.id !== id);
      saveDemoHomework(demoHomework);
      console.log('✅ Homework deleted from localStorage');
      return Promise.resolve({ data: { success: true } });
    }
    return api.delete(`/homework/${id}`);
  },
};

// Demo AI responses
const demoAIResponses = {
  generateQuiz: (data: any) => {
    const numQ = data.numQuestions || 5;

    // Generate realistic demo questions based on subject
    const questionTemplates: Record<string, any[]> = {
      Math: [
        { q: 'What is 15% of 200?', opts: ['30', '25', '35', '20'], correct: 0 },
        { q: 'Solve: 3x + 5 = 20', opts: ['x = 5', 'x = 6', 'x = 7', 'x = 4'], correct: 0 },
        { q: 'What is the area of a circle with radius 5?', opts: ['78.5', '31.4', '25', '50'], correct: 0 },
        { q: 'What is the square root of 144?', opts: ['12', '11', '13', '14'], correct: 0 },
        { q: 'What is 7 × 8?', opts: ['56', '54', '58', '52'], correct: 0 },
      ],
      Science: [
        { q: 'What is the chemical symbol for water?', opts: ['H₂O', 'CO₂', 'O₂', 'H₂'], correct: 0 },
        { q: 'What is the powerhouse of the cell?', opts: ['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast'], correct: 0 },
        { q: 'What is the speed of light?', opts: ['299,792 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], correct: 0 },
        { q: 'What gas do plants absorb from the atmosphere?', opts: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correct: 0 },
        { q: 'How many planets are in our solar system?', opts: ['8', '7', '9', '10'], correct: 0 },
      ],
      History: [
        { q: 'When did World War II end?', opts: ['1945', '1944', '1946', '1943'], correct: 0 },
        { q: 'Who was the first President of the United States?', opts: ['George Washington', 'Thomas Jefferson', 'John Adams', 'Benjamin Franklin'], correct: 0 },
        { q: 'In which year did Columbus discover America?', opts: ['1492', '1491', '1493', '1500'], correct: 0 },
        { q: 'What ancient civilization built the pyramids?', opts: ['Egyptians', 'Romans', 'Greeks', 'Mayans'], correct: 0 },
        { q: 'When did the Berlin Wall fall?', opts: ['1989', '1988', '1990', '1987'], correct: 0 },
      ],
    };

    // Default generic questions
    const defaultQuestions = [
      { q: `What is a key concept in ${data.topic}?`, opts: ['Fundamental principle', 'Minor detail', 'Unrelated topic', 'Random fact'], correct: 0 },
      { q: `Which statement about ${data.topic} is true?`, opts: ['It is an important topic', 'It is irrelevant', 'It does not exist', 'None of the above'], correct: 0 },
      { q: `How would you describe ${data.topic}?`, opts: ['A significant subject area', 'A simple concept', 'An outdated idea', 'A myth'], correct: 0 },
      { q: `What is the main focus of ${data.topic}?`, opts: ['Core understanding', 'Peripheral knowledge', 'Unrelated content', 'Historical context only'], correct: 0 },
      { q: `Why is ${data.topic} important in ${data.subject}?`, opts: ['It is fundamental to understanding', 'It is not important', 'It is optional', 'It is outdated'], correct: 0 },
    ];

    const questionPool = questionTemplates[data.subject] || defaultQuestions;
    const questions = [];

    for (let i = 0; i < numQ && i < questionPool.length; i++) {
      const template = questionPool[i % questionPool.length];
      questions.push({
        question: template.q,
        options: template.opts,
        correctAnswer: template.correct,
      });
    }

    return Promise.resolve({
      data: {
        quiz: { questions },
        points: 10,
      }
    });
  },

  chat: (message: string) => {
    const lowerMessage = message.toLowerCase();

    let response = '';

    // Contextual responses based on keywords
    if (lowerMessage.includes('math') || lowerMessage.includes('solve') || /\d+/.test(message)) {
      response = `Great question about math! 🔢\n\nFor math problems, I recommend:\n1. Identify what you're solving for\n2. Write down what you know\n3. Apply the relevant formula\n4. Show your work step by step\n\nWould you like me to help you solve a specific problem?`;
    } else if (lowerMessage.includes('science') || lowerMessage.includes('experiment') || lowerMessage.includes('photosynthesis')) {
      response = `Interesting science question! 🔬\n\nScience is all about understanding how things work. Let me help you break this down:\n\n• Start with the basic concept\n• Understand the process\n• Learn the key terms\n• Apply it to real examples\n\nWhat specific aspect would you like to explore?`;
    } else if (lowerMessage.includes('history') || lowerMessage.includes('war') || lowerMessage.includes('when')) {
      response = `Great history question! 📚\n\nWhen studying history, remember:\n• Context is everything\n• Understand cause and effect\n• Remember key dates and figures\n• Connect events to today\n\nWhat historical topic interests you most?`;
    } else if (lowerMessage.includes('essay') || lowerMessage.includes('write') || lowerMessage.includes('paragraph')) {
      response = `Excellent question about writing! ✍️\n\nFor strong writing:\n1. Start with a clear thesis\n2. Support with evidence\n3. Use clear transitions\n4. Conclude strongly\n\nWhat are you writing about?`;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      response = `I'm here to help! 🎓\n\nI can assist with:\n• Math problems and equations\n• Science concepts and experiments\n• History events and dates\n• Writing essays and papers\n• Study strategies\n\nWhat subject are you working on today?`;
    } else {
      response = `That's a thoughtful question! Let me help you understand this better.\n\nHere's what I suggest:\n1. Break down the problem into smaller parts\n2. Focus on understanding the core concept\n3. Practice with examples\n4. Ask specific questions when stuck\n\nFeel free to ask me anything specific!`;
    }

    return Promise.resolve({
      data: {
        message: `${response}\n\n💡 Demo Mode Active - Connect the backend with an Anthropic API key for advanced AI tutoring powered by Claude!`,
        sessionId: 'demo-session',
      }
    });
  },

  solveHomework: (question: string, subject: string) => {
    const lowerQuestion = question.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    let solution = '';
    let keyPoints: string[] = [];

    // Math-specific help
    if (lowerSubject.includes('math')) {
      if (lowerQuestion.includes('solve') || lowerQuestion.includes('x')) {
        solution = `## Step-by-Step Math Solution 🔢\n\n**Question:** ${question}\n\n**Step 1: Identify the equation**\nLook at what we need to solve for (usually x or another variable)\n\n**Step 2: Isolate the variable**\n- Move constants to one side\n- Keep variables on the other side\n- Use inverse operations\n\n**Step 3: Simplify**\nCombine like terms and solve\n\n**Step 4: Check your answer**\nPlug the value back into the original equation\n\n💡 **Tip:** Always show your work step by step!`;
        keyPoints = ['Isolate the variable', 'Use inverse operations', 'Check your answer'];
      } else if (lowerQuestion.includes('percent') || lowerQuestion.includes('%')) {
        solution = `## Percentage Problem Solution 📊\n\n**Question:** ${question}\n\n**Step 1: Identify what you know**\n- What is the whole amount?\n- What percentage are we finding?\n\n**Step 2: Convert percentage to decimal**\nDivide by 100 (e.g., 25% = 0.25)\n\n**Step 3: Multiply**\nWhole amount × decimal = answer\n\n**Step 4: Verify**\nDoes the answer make sense?\n\n💡 **Remember:** "Of" means multiply!`;
        keyPoints = ['Convert % to decimal', 'Multiply whole × decimal', 'Verify your answer'];
      } else {
        solution = `## Math Solution 🔢\n\n**Question:** ${question}\n\n**Approach:**\n1. Read the problem carefully\n2. Identify what is given and what you need to find\n3. Choose the right formula or method\n4. Solve step by step\n5. Check if the answer makes sense\n\n💡 **Tip:** Draw a diagram if helpful!`;
        keyPoints = ['Read carefully', 'Choose the right method', 'Show your work'];
      }
    }
    // Science-specific help
    else if (lowerSubject.includes('science') || lowerSubject.includes('biology') || lowerSubject.includes('chemistry') || lowerSubject.includes('physics')) {
      solution = `## Science Concept Explanation 🔬\n\n**Question:** ${question}\n\n**Understanding the Concept:**\n- Start with the basic definition\n- Understand the process or mechanism\n- Identify key components\n\n**Real-World Application:**\nHow does this apply to everyday life?\n\n**Key Terms to Remember:**\nMake a list of important vocabulary\n\n**Diagram/Visual:**\nDraw or visualize the concept\n\n💡 **Tip:** Connect new concepts to what you already know!`;
      keyPoints = ['Understand the basics', 'Learn key terms', 'Make connections'];
    }
    // History-specific help
    else if (lowerSubject.includes('history') || lowerSubject.includes('social')) {
      solution = `## History Analysis 📚\n\n**Question:** ${question}\n\n**Context:**\n- When did this happen?\n- Where did it take place?\n- Who was involved?\n\n**Cause and Effect:**\n- What led to this event?\n- What were the consequences?\n\n**Significance:**\nWhy is this important to remember?\n\n**Connections:**\nHow does this relate to other events?\n\n💡 **Tip:** Create a timeline to visualize events!`;
      keyPoints = ['Understand context', 'Identify cause/effect', 'Note significance'];
    }
    // English/Writing help
    else if (lowerSubject.includes('english') || lowerSubject.includes('writing') || lowerSubject.includes('literature')) {
      solution = `## Writing Guide ✍️\n\n**Question:** ${question}\n\n**Structure:**\n1. **Introduction:** Hook + thesis statement\n2. **Body Paragraphs:** Topic sentence + evidence + analysis\n3. **Conclusion:** Restate thesis + summarize + final thought\n\n**Writing Tips:**\n- Use clear topic sentences\n- Support claims with evidence\n- Use transitions between ideas\n- Vary sentence structure\n\n💡 **Remember:** Every paragraph should support your thesis!`;
      keyPoints = ['Clear thesis', 'Strong evidence', 'Good transitions'];
    }
    // Generic help
    else {
      solution = `## Solution Guide 📖\n\n**Question:** ${question}\n\n**Approach:**\n1. **Understand:** What is the question asking?\n2. **Plan:** What strategy will you use?\n3. **Execute:** Work through the problem\n4. **Review:** Check your answer\n\n**Tips:**\n- Break complex problems into smaller parts\n- Look for patterns or similar examples\n- Don't be afraid to try different approaches\n- Ask for help if stuck\n\n💡 **Remember:** Learning is a process!`;
      keyPoints = ['Understand the question', 'Plan your approach', 'Review your work'];
    }

    solution += `\n\n---\n💡 **Demo Mode Active** - For detailed AI-powered solutions with personalized explanations, connect the backend with your Anthropic API key!`;

    return Promise.resolve({
      data: {
        solution,
        points: 5,
        keyPoints,
      }
    });
  }
};

// AI API
export const aiAPI = {
  solveHomework: (question: string, subject: string) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using mock AI homework solver');

      // Award points for using AI
      aiUsageCount++;
      const updatedPoints = awardPoints(5, 'AI Homework Help used');

      return demoAIResponses.solveHomework(question, subject).then(response => ({
        ...response,
        data: {
          ...response.data,
          pointsEarned: 5,
          totalPoints: updatedPoints.totalPoints,
          aiUsageCount
        }
      }));
    }
    return api.post('/ai/solve', { question, subject });
  },

  generateQuiz: (data: {
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    numQuestions?: number;
  }) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using mock quiz generator');
      return demoAIResponses.generateQuiz(data);
    }
    return api.post('/ai/quiz', data);
  },

  chat: (message: string, sessionId?: string) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using mock AI chat');

      // Award points for using AI chat
      aiUsageCount++;
      const updatedPoints = awardPoints(3, 'AI Chat used');

      return demoAIResponses.chat(message).then(response => ({
        ...response,
        data: {
          ...response.data,
          pointsEarned: 3,
          totalPoints: updatedPoints.totalPoints
        }
      }));
    }
    return api.post('/ai/chat', { message, sessionId });
  },

  getChatHistory: (sessionId: string) => api.get(`/ai/chat/${sessionId}`),
};

// Demo messaging storage
const MESSAGES_STORAGE_KEY = 'demo_messages';

const loadDemoMessages = (): any[] => {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading messages from localStorage:', error);
    return [];
  }
};

const saveDemoMessages = (messages: any[]) => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to localStorage:', error);
  }
};

let demoMessages: any[] = loadDemoMessages();

// Messaging API
export const messagingAPI = {
  getConversations: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Loading conversations from localStorage');
      const messages = loadDemoMessages();

      // Group messages by conversation
      const conversations: any[] = [];
      const conversationMap = new Map();

      messages.forEach((msg: any) => {
        const otherUserId = msg.senderId === 'current-user' ? msg.receiverId : msg.senderId;

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: msg.senderId === 'current-user' ? msg.receiverName : msg.senderName,
            userRole: msg.senderId === 'current-user' ? msg.receiverRole : msg.senderRole,
            lastMessage: msg.content,
            lastMessageTime: msg.timestamp,
            unreadCount: msg.senderId !== 'current-user' && !msg.read ? 1 : 0,
          });
        } else {
          const conv = conversationMap.get(otherUserId);
          if (new Date(msg.timestamp) > new Date(conv.lastMessageTime)) {
            conv.lastMessage = msg.content;
            conv.lastMessageTime = msg.timestamp;
          }
          if (msg.senderId !== 'current-user' && !msg.read) {
            conv.unreadCount++;
          }
        }
      });

      conversationMap.forEach(conv => conversations.push(conv));
      conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      return Promise.resolve({ data: { conversations } });
    }
    return api.get('/messages/conversations');
  },

  getMessages: (userId: string) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Loading messages from localStorage');
      const allMessages = loadDemoMessages();
      const messages = allMessages.filter(
        (msg: any) =>
          (msg.senderId === 'current-user' && msg.receiverId === userId) ||
          (msg.senderId === userId && msg.receiverId === 'current-user')
      );

      // Mark messages as read
      allMessages.forEach((msg: any) => {
        if (msg.senderId === userId && msg.receiverId === 'current-user') {
          msg.read = true;
        }
      });
      saveDemoMessages(allMessages);

      return Promise.resolve({ data: { messages } });
    }
    return api.get(`/messages/${userId}`);
  },

  sendMessage: (receiverId: string, content: string, receiverName: string, receiverRole: string) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Sending message locally');
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'current-user',
        senderName: 'You',
        senderRole: 'student',
        receiverId,
        receiverName,
        receiverRole,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };

      demoMessages.push(newMessage);
      saveDemoMessages(demoMessages);
      console.log('✅ Message sent and saved');

      return Promise.resolve({ data: { message: newMessage } });
    }
    return api.post('/messages', { receiverId, content });
  },

  markAsRead: (messageId: string) => {
    if (isDemoMode()) {
      const allMessages = loadDemoMessages();
      const message = allMessages.find((m: any) => m.id === messageId);
      if (message) {
        message.read = true;
        saveDemoMessages(allMessages);
      }
      return Promise.resolve({ data: { success: true } });
    }
    return api.put(`/messages/${messageId}/read`);
  },

  getUnreadCount: () => {
    if (isDemoMode()) {
      const messages = loadDemoMessages();
      const unreadCount = messages.filter(
        (msg: any) => msg.receiverId === 'current-user' && !msg.read
      ).length;
      return Promise.resolve({ data: { unreadCount } });
    }
    return api.get('/messages/unread-count');
  },
};

// Parent API
export const parentAPI = {
  getDashboard: () => api.get('/parents/dashboard'),

  getInsights: (studentId: string) => api.get(`/parents/insights/${studentId}`),

  getReports: (studentId: string, period?: string) =>
    api.get(`/parents/reports/${studentId}`, { params: { period } }),

  linkChild: (childId: string) => api.post('/parents/link-child', { childId }),

  getNotifications: () => api.get('/parents/notifications'),

  // Get linked children for messaging
  getChildren: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using demo children data');
      return Promise.resolve({
        data: {
          children: [
            {
              id: 'child-1',
              name: 'Alex Smith',
              email: 'alex@example.com',
              grade: '8th Grade',
              avatar: null,
            }
          ]
        }
      });
    }
    return api.get('/parents/children');
  },
};

// Demo gamification tracking
let homeworkCompletedCount = 0;
let quizzesCompletedCount = 0;
let aiUsageCount = 0;

// Helper to award points and check badges
const awardPoints = (pointsToAdd: number, reason: string) => {
  demoGamificationData.points.totalPoints += pointsToAdd;

  // Update level (every 100 points = 1 level)
  demoGamificationData.points.level = Math.floor(demoGamificationData.points.totalPoints / 100) + 1;
  demoGamificationData.points.pointsToNextLevel = 100 - (demoGamificationData.points.totalPoints % 100);

  // Check and unlock badges
  checkAndUnlockBadges();

  console.log(`🎉 +${pointsToAdd} points! (${reason})`);
  return demoGamificationData.points;
};

const checkAndUnlockBadges = () => {
  // First Steps - Complete 1 homework
  if (homeworkCompletedCount >= 1 && !demoGamificationData.allBadges[0].earned) {
    demoGamificationData.allBadges[0].earned = true;
    demoGamificationData.allBadges[0].earnedAt = new Date().toISOString();
    console.log('🏅 Badge Unlocked: First Steps!');
  }

  // Quick Learner - Complete 5 homework
  if (homeworkCompletedCount >= 5 && !demoGamificationData.allBadges[1].earned) {
    demoGamificationData.allBadges[1].earned = true;
    demoGamificationData.allBadges[1].earnedAt = new Date().toISOString();
    console.log('🏅 Badge Unlocked: Quick Learner!');
  }

  // Homework Hero - Complete 10 homework
  if (homeworkCompletedCount >= 10 && !demoGamificationData.allBadges[2].earned) {
    demoGamificationData.allBadges[2].earned = true;
    demoGamificationData.allBadges[2].earnedAt = new Date().toISOString();
    console.log('🏅 Badge Unlocked: Homework Hero!');
  }

  // Quiz Master - Score 100% on any quiz (we'll track this separately)

  // AI Enthusiast - Use AI helper 10 times
  if (aiUsageCount >= 10 && !demoGamificationData.allBadges[5].earned) {
    demoGamificationData.allBadges[5].earned = true;
    demoGamificationData.allBadges[5].earnedAt = new Date().toISOString();
    console.log('🏅 Badge Unlocked: AI Enthusiast!');
  }

  // Points Collector - Earn 500 total points
  if (demoGamificationData.points.totalPoints >= 500 && !demoGamificationData.allBadges[6].earned) {
    demoGamificationData.allBadges[6].earned = true;
    demoGamificationData.allBadges[6].earnedAt = new Date().toISOString();
    console.log('🏅 Badge Unlocked: Points Collector!');
  }
};

// Demo gamification data
const demoGamificationData = {
  points: {
    totalPoints: 0,
    level: 1,
    rank: 1,
    pointsToNextLevel: 100,
  },

  allBadges: [
    { id: '1', name: 'First Steps', description: 'Complete your first homework', icon: 'star', requirement: 'Complete 1 homework', points: 10, earned: false },
    { id: '2', name: 'Quick Learner', description: 'Complete 5 homework assignments', icon: 'zap', requirement: 'Complete 5 homework', points: 25, earned: false },
    { id: '3', name: 'Homework Hero', description: 'Complete 10 homework assignments', icon: 'trophy', requirement: 'Complete 10 homework', points: 50, earned: false },
    { id: '4', name: 'Quiz Master', description: 'Score 100% on any quiz', icon: 'award', requirement: 'Get perfect score', points: 30, earned: false },
    { id: '5', name: 'Streak Champion', description: 'Maintain a 7-day learning streak', icon: 'medal', requirement: '7 consecutive days', points: 40, earned: false },
    { id: '6', name: 'AI Enthusiast', description: 'Use AI helper 10 times', icon: 'crown', requirement: 'Use AI helper 10x', points: 20, earned: false },
    { id: '7', name: 'Points Collector', description: 'Earn 500 total points', icon: 'star', requirement: 'Reach 500 points', points: 100, earned: false },
    { id: '8', name: 'Early Bird', description: 'Complete homework before due date 5 times', icon: 'zap', requirement: 'Early completion 5x', points: 35, earned: false },
    { id: '9', name: 'Perfect Week', description: 'Complete all homework in a week', icon: 'medal', requirement: '100% weekly completion', points: 60, earned: false },
  ],

  leaderboard: [
    { rank: 1, userId: 'user-001', userName: 'Emma Johnson', points: 450, level: 5, badges: 6 },
    { rank: 2, userId: 'user-002', userName: 'Liam Chen', points: 380, level: 4, badges: 5 },
    { rank: 3, userId: 'user-004', userName: 'Sophia Martinez', points: 320, level: 4, badges: 4 },
    { rank: 4, userId: 'user-005', userName: 'Noah Williams', points: 280, level: 3, badges: 4 },
    { rank: 5, userId: 'user-006', userName: 'Olivia Brown', points: 250, level: 3, badges: 3 },
    { rank: 6, userId: 'user-007', userName: 'Ethan Davis', points: 210, level: 3, badges: 3 },
    { rank: 7, userId: 'user-008', userName: 'Ava Garcia', points: 180, level: 2, badges: 3 },
    { rank: 8, userId: 'user-009', userName: 'Mason Rodriguez', points: 150, level: 2, badges: 2 },
    { rank: 9, userId: 'user-010', userName: 'Isabella Lopez', points: 120, level: 2, badges: 2 },
    { rank: 10, userId: 'demo-user', userName: 'You', points: 0, level: 1, badges: 0 },
  ],

  rewards: [
    { id: 'r1', name: 'Extra Time', description: '10 minutes extra time on next quiz', cost: 100, icon: 'gift', available: true },
    { id: 'r2', name: 'Skip Assignment', description: 'Skip one homework assignment', cost: 200, icon: 'star', available: true },
    { id: 'r3', name: 'Custom Avatar', description: 'Unlock a premium avatar', cost: 150, icon: 'crown', available: true },
    { id: 'r4', name: 'Homework Pass', description: 'Get automatic 100% on one homework', cost: 300, icon: 'trophy', available: true },
    { id: 'r5', name: 'AI Boost', description: '5 free AI tutor sessions', cost: 250, icon: 'gift', available: true },
    { id: 'r6', name: 'Golden Badge', description: 'Exclusive golden profile badge', cost: 500, icon: 'crown', available: true },
  ],
};

// Gamification API
export const gamificationAPI = {
  getPoints: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using demo points data');
      return Promise.resolve({ data: demoGamificationData.points });
    }
    return api.get('/gamification/points');
  },

  getAllBadges: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using demo badges data');
      return Promise.resolve({ data: { badges: demoGamificationData.allBadges } });
    }
    return api.get('/gamification/badges');
  },

  getEarnedBadges: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using demo earned badges');
      const earnedBadges = demoGamificationData.allBadges.filter(b => b.earned);
      return Promise.resolve({ data: { badges: earnedBadges } });
    }
    return api.get('/gamification/badges/earned');
  },

  getLeaderboard: (limit?: number) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using demo leaderboard');
      const leaderboard = limit
        ? demoGamificationData.leaderboard.slice(0, limit)
        : demoGamificationData.leaderboard;
      return Promise.resolve({ data: { leaderboard } });
    }
    return api.get('/gamification/leaderboard', { params: { limit } });
  },

  getRewards: () => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Using demo rewards');
      return Promise.resolve({ data: { rewards: demoGamificationData.rewards } });
    }
    return api.get('/gamification/rewards');
  },

  redeemReward: (rewardId: string) => {
    if (isDemoMode()) {
      console.warn('🎭 DEMO MODE: Redeeming reward locally');
      const reward = demoGamificationData.rewards.find(r => r.id === rewardId);
      if (reward) {
        demoGamificationData.points.totalPoints -= reward.cost;
        // Mark reward as redeemed (for demo purposes)
        reward.available = false;
      }
      return Promise.resolve({ data: { success: true, pointsRemaining: demoGamificationData.points.totalPoints } });
    }
    return api.post('/gamification/rewards/redeem', { rewardId });
  },
};

export default api;
