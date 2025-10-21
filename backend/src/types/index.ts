export interface User {
  id: string;
  email: string;
  role: 'student' | 'parent' | 'admin';
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface Homework {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  difficulty: 'easy' | 'medium' | 'hard';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Quiz {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: Date;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  points: number;
  category: string;
}

export interface StudentProgress {
  studentId: string;
  totalPoints: number;
  badges: Badge[];
  completedHomework: number;
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  learningPath: LearningPathItem[];
}

export interface LearningPathItem {
  subject: string;
  topic: string;
  status: 'not_started' | 'in_progress' | 'completed';
  recommendedResources: string[];
}

export interface ParentInsight {
  studentId: string;
  date: Date;
  summary: string;
  recommendations: string[];
  concerns: string[];
  achievements: string[];
}
