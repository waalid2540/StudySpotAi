import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Homework } from '../types';

// In-memory storage (replace with database in production)
export const homeworkStore: Map<string, Homework> = new Map();

export class HomeworkController {
  /**
   * Create new homework
   */
  async create(req: any, res: Response): Promise<any> {
    try {
      const { subject, title, description, dueDate, difficulty } = req.body;
      const studentId = req.user?.userId;

      console.log('Creating homework:', { subject, title, description, dueDate, difficulty, studentId });

      if (!studentId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Validation
      if (!subject || !title || !dueDate) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['subject', 'title', 'dueDate'],
          received: { subject: !!subject, title: !!title, dueDate: !!dueDate }
        });
      }

      const homework: Homework = {
        id: uuidv4(),
        studentId,
        subject,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        status: 'pending',
        difficulty: difficulty || 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      homeworkStore.set(homework.id, homework);
      console.log('Homework created successfully:', homework.id);

      // Emit real-time event for parent monitoring
      const io = req.app.get('io');
      if (io) {
        io.to(`parent-${studentId}`).emit('homework-created', homework);
      }

      res.status(201).json({
        message: 'Homework created successfully',
        homework,
      });
    } catch (error: any) {
      console.error('Create homework error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Failed to create homework' });
    }
  }

  /**
   * Get all homework for a student
   */
  async getAll(req: any, res: Response): Promise<any> {
    try {
      const studentId = req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const homeworkList = Array.from(homeworkStore.values())
        .filter(hw => hw.studentId === studentId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.json({
        homework: homeworkList,
        total: homeworkList.length,
      });
    } catch (error: any) {
      console.error('Get homework error:', error);
      res.status(500).json({ error: error.message || 'Failed to get homework' });
    }
  }

  /**
   * Get single homework
   */
  async getById(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const homework = homeworkStore.get(id);

      if (!homework) {
        return res.status(404).json({ error: 'Homework not found' });
      }

      // Check if user owns this homework
      if (homework.studentId !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ homework });
    } catch (error: any) {
      console.error('Get homework by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to get homework' });
    }
  }

  /**
   * Update homework
   */
  async update(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const homework = homeworkStore.get(id);

      if (!homework) {
        return res.status(404).json({ error: 'Homework not found' });
      }

      if (homework.studentId !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updated: Homework = {
        ...homework,
        ...req.body,
        id: homework.id,
        studentId: homework.studentId,
        updatedAt: new Date(),
      };

      homeworkStore.set(id, updated);

      // Emit real-time event
      const io = req.app.get('io');
      if (io) {
        io.to(`parent-${homework.studentId}`).emit('homework-updated', updated);
      }

      res.json({
        message: 'Homework updated successfully',
        homework: updated,
      });
    } catch (error: any) {
      console.error('Update homework error:', error);
      res.status(500).json({ error: error.message || 'Failed to update homework' });
    }
  }

  /**
   * Mark homework as completed
   */
  async complete(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const homework = homeworkStore.get(id);

      if (!homework) {
        return res.status(404).json({ error: 'Homework not found' });
      }

      if (homework.studentId !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const completed: Homework = {
        ...homework,
        status: 'completed',
        updatedAt: new Date(),
      };

      homeworkStore.set(id, completed);

      // Award points for completion
      const points = homework.difficulty === 'hard' ? 50 : homework.difficulty === 'medium' ? 30 : 20;

      // Emit real-time events
      const io = req.app.get('io');
      if (io) {
        io.to(`parent-${homework.studentId}`).emit('homework-completed', {
          homework: completed,
          points,
        });
        io.to(`student-${homework.studentId}`).emit('points-earned', {
          points,
          reason: `Completed homework: ${homework.title}`,
        });
      }

      res.json({
        message: 'Homework marked as completed',
        homework: completed,
        pointsEarned: points,
      });
    } catch (error: any) {
      console.error('Complete homework error:', error);
      res.status(500).json({ error: error.message || 'Failed to complete homework' });
    }
  }

  /**
   * Delete homework
   */
  async delete(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const homework = homeworkStore.get(id);

      if (!homework) {
        return res.status(404).json({ error: 'Homework not found' });
      }

      if (homework.studentId !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      homeworkStore.delete(id);

      res.json({ message: 'Homework deleted successfully' });
    } catch (error: any) {
      console.error('Delete homework error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete homework' });
    }
  }
}

export const homeworkController = new HomeworkController();
