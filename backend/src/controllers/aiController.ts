import { Response } from 'express';
import { aiService } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

// In-memory chat sessions storage
const chatSessions: Map<string, any[]> = new Map();

export class AIController {
  /**
   * Get AI homework help
   */
  async solveHomework(req: any, res: Response): Promise<any> {
    try {
      const { question, subject } = req.body;

      if (!question || !subject) {
        return res.status(400).json({ error: 'Question and subject are required' });
      }

      const solution = await aiService.solveHomework(question, subject);

      // Award points for using AI tutor
      const io = req.app.get('io');
      if (io && req.user?.uid) {
        io.to(`student-${req.user.uid}`).emit('points-earned', {
          points: 5,
          reason: 'Used AI Homework Assistant',
        });
      }

      res.json({
        question,
        subject,
        solution,
        pointsEarned: 5,
      });
    } catch (error: any) {
      console.error('AI Solve Homework Error:', error);
      res.status(500).json({ error: error.message || 'Failed to solve homework' });
    }
  }

  /**
   * Generate AI quiz
   */
  async generateQuiz(req: any, res: Response): Promise<any> {
    try {
      const { subject, topic, difficulty, numQuestions } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({ error: 'Subject and topic are required' });
      }

      const questions = await aiService.generateQuiz(
        subject,
        topic,
        difficulty || 'medium',
        numQuestions || 5
      );

      const quizId = uuidv4();
      const quiz = {
        id: quizId,
        studentId: req.user?.uid,
        subject,
        topic,
        difficulty: difficulty || 'medium',
        questions,
        createdAt: new Date(),
      };

      res.json({
        message: 'Quiz generated successfully',
        quiz,
      });
    } catch (error: any) {
      console.error('AI Generate Quiz Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate quiz' });
    }
  }

  /**
   * Chat with AI tutor
   */
  async chat(req: any, res: Response): Promise<any> {
    try {
      const { message, sessionId } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get or create chat session
      const sid = sessionId || uuidv4();
      const session = chatSessions.get(sid) || [];

      // Add user message
      session.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      // Get AI response
      const aiResponse = await aiService.chat(session);

      // Add AI response to session
      session.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      });

      chatSessions.set(sid, session);

      res.json({
        sessionId: sid,
        message: aiResponse,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ error: error.message || 'Failed to process chat message' });
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(req: any, res: Response): Promise<any> {
    try {
      const { sessionId } = req.params;
      const session = chatSessions.get(sessionId) || [];

      res.json({
        sessionId,
        messages: session,
      });
    } catch (error: any) {
      console.error('Get Chat History Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get chat history' });
    }
  }

  /**
   * Analyze image (OCR for homework)
   */
  async analyzeImage(req: any, res: Response): Promise<any> {
    try {
      // This would integrate with OCR service (Google Vision, AWS Textract, etc.)
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // Placeholder for OCR implementation
      res.json({
        message: 'Image analysis feature coming soon',
        extractedText: 'OCR integration required',
      });
    } catch (error: any) {
      console.error('Analyze Image Error:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze image' });
    }
  }
}

export const aiController = new AIController();
