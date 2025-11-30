import { Response } from 'express';
import { aiService } from '../services/aiService';
import { homeworkStore } from './homeworkController';
import { emailService } from '../services/emailService';
import { AppDataSource } from '../config/database';
import { ParentChildLink } from '../entities/ParentChildLink';
import { User } from '../entities/User';

// Generate a random 6-character link code
function generateLinkCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Get or create link code for a student (stored in database)
async function getOrCreateLinkCode(studentId: string): Promise<string> {
  const userRepository = AppDataSource.getRepository(User);
  const student = await userRepository.findOne({ where: { id: studentId } });

  if (!student) {
    throw new Error('Student not found');
  }

  // If student already has a link code, return it
  if (student.link_code) {
    return student.link_code;
  }

  // Generate new unique link code
  let newCode = generateLinkCode();
  let codeExists = true;

  while (codeExists) {
    const existingUser = await userRepository.findOne({ where: { link_code: newCode } });
    if (!existingUser) {
      codeExists = false;
    } else {
      newCode = generateLinkCode();
    }
  }

  // Save the link code to the user
  student.link_code = newCode;
  await userRepository.save(student);

  console.log(`Generated link code ${newCode} for student ${studentId}`);
  return newCode;
}

export class ParentController {
  /**
   * Get parent dashboard overview
   */
  async getDashboard(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;

      // Get linked children from database
      const linkRepository = AppDataSource.getRepository(ParentChildLink);
      const userRepository = AppDataSource.getRepository(User);

      const links = await linkRepository.find({
        where: { parent_id: parentId, is_active: true },
        relations: ['student'],
      });

      // Get REAL homework for each linked child
      const overview = await Promise.all(links.map(async (link) => {
        const childId = link.student_id;
        const student = await userRepository.findOne({ where: { id: childId } });

        // Get all homework for this child
        const childHomework = Array.from(homeworkStore.values())
          .filter(hw => hw.studentId === childId);

        const completedHomework = childHomework.filter(hw => hw.status === 'completed').length;
        const pendingHomework = childHomework.filter(hw => hw.status === 'pending').length;

        // Get recent activity (last 5 homework items)
        const recentActivity = childHomework
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 5)
          .map(hw => ({
            type: hw.status === 'completed' ? 'homework_completed' : 'homework_assigned',
            title: hw.title,
            subject: hw.subject,
            status: hw.status,
            timestamp: hw.updatedAt,
          }));

        return {
          childId,
          name: student ? `${student.first_name} ${student.last_name}` : 'Student',
          email: student?.email,
          completedHomework,
          pendingHomework,
          totalHomework: childHomework.length,
          recentActivity,
        };
      }));

      const dashboardData = {
        totalChildren: links.length,
        overview,
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error('Get Parent Dashboard Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get dashboard' });
    }
  }

  /**
   * Get detailed student insights
   */
  async getStudentInsights(req: any, res: Response): Promise<any> {
    try {
      const { studentId } = req.params;

      // Mock homework and quiz data
      const homeworkData = [
        { subject: 'Math', completed: true, score: 85 },
        { subject: 'Science', completed: true, score: 90 },
      ];
      const quizScores = [85, 90, 78, 92, 88];
      const subjects = ['Math', 'Science', 'English'];

      // Generate AI insights
      const insights = await aiService.generateInsights(
        homeworkData,
        quizScores,
        subjects
      );

      const detailedInsights = {
        studentId,
        period: 'Last 30 days',
        summary: {
          totalHomework: 20,
          completedHomework: 18,
          averageScore: 86,
          totalPoints: 540,
          badges: 12,
          studyTimeHours: 25,
        },
        performance: {
          strengths: insights.strengths,
          weaknesses: insights.weaknesses,
          trends: [
            { subject: 'Math', trend: 'improving', change: '+8%' },
            { subject: 'Science', trend: 'stable', change: '0%' },
            { subject: 'English', trend: 'needs_attention', change: '-5%' },
          ],
        },
        recommendations: insights.recommendations,
        recentAchievements: [
          {
            type: 'badge',
            title: 'Math Master',
            description: 'Completed 10 math assignments',
            earnedAt: new Date(),
          },
          {
            type: 'milestone',
            title: '500 Points Milestone',
            description: 'Reached 500 total points',
            earnedAt: new Date(),
          },
        ],
        concerns: [
          {
            area: 'English Writing',
            description: 'Scores declining in recent assignments',
            suggestion: 'Consider additional practice with creative writing exercises',
          },
        ],
      };

      res.json(detailedInsights);
    } catch (error: any) {
      console.error('Get Student Insights Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get insights' });
    }
  }

  /**
   * Get progress reports
   */
  async getProgressReports(req: any, res: Response): Promise<any> {
    try {
      const { studentId } = req.params;
      const { period } = req.query;

      const report = {
        studentId,
        period: period || 'monthly',
        generatedAt: new Date(),
        academicProgress: {
          overallGrade: 'B+',
          gpa: 3.5,
          subjects: [
            {
              name: 'Mathematics',
              grade: 'A',
              percentage: 92,
              improvement: '+5%',
              teacher_comment: 'Excellent progress in algebra',
            },
            {
              name: 'Science',
              grade: 'A-',
              percentage: 88,
              improvement: '+2%',
              teacher_comment: 'Strong understanding of concepts',
            },
            {
              name: 'English',
              grade: 'B',
              percentage: 82,
              improvement: '-3%',
              teacher_comment: 'Needs more practice in essay writing',
            },
          ],
        },
        behavioralMetrics: {
          attendance: '95%',
          homeworkCompletionRate: '90%',
          averageStudyTimePerDay: '2.5 hours',
          focusScore: 85,
        },
        recommendations: [
          'Consider extra tutoring for English writing',
          'Excellent progress in Math - encourage advanced topics',
          'Maintain current study schedule',
        ],
      };

      res.json(report);
    } catch (error: any) {
      console.error('Get Progress Reports Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get reports' });
    }
  }

  /**
   * Link child to parent account using link code
   */
  async linkChild(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;
      const { linkCode } = req.body;

      if (!linkCode) {
        return res.status(400).json({ error: 'Link code is required' });
      }

      const upperCode = linkCode.toUpperCase();

      // Get repositories
      const linkRepository = AppDataSource.getRepository(ParentChildLink);
      const userRepository = AppDataSource.getRepository(User);

      // Find student by link code in database
      const student = await userRepository.findOne({
        where: { link_code: upperCode }
      });

      if (!student) {
        return res.status(404).json({
          error: 'Invalid link code. Please check the code and try again.'
        });
      }

      const studentId = student.id;

      // Check if link already exists
      const existingLink = await linkRepository.findOne({
        where: {
          parent_id: parentId,
          student_id: studentId,
        }
      });

      if (existingLink) {
        if (!existingLink.is_active) {
          // Reactivate the link
          existingLink.is_active = true;
          await linkRepository.save(existingLink);
        }

        return res.json({
          message: 'Child already linked',
          student: {
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            email: student.email,
          },
        });
      }

      // Create new link
      const newLink = linkRepository.create({
        parent_id: parentId,
        student_id: studentId,
        link_code: upperCode,
        is_active: true,
      });

      await linkRepository.save(newLink);

      console.log(`✅ Linked child using code: ${upperCode} -> Student ID: ${studentId}`);

      res.json({
        message: 'Child linked successfully',
        student: {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
        },
      });
    } catch (error: any) {
      console.error('Link Child Error:', error);
      res.status(500).json({ error: error.message || 'Failed to link child' });
    }
  }

  /**
   * Get student's link code (for students to share with parents)
   */
  async getStudentLinkCode(req: any, res: Response): Promise<any> {
    try {
      const studentId = req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get or create link code for this student
      const linkCode = await getOrCreateLinkCode(studentId);

      res.json({
        studentId,
        linkCode,
        message: 'Share this code with your parents to let them monitor your progress'
      });
    } catch (error: any) {
      console.error('Get Link Code Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get link code' });
    }
  }

  /**
   * Send link code to parent via email
   */
  async sendLinkCodeEmail(req: any, res: Response): Promise<any> {
    try {
      const studentId = req.user?.userId;
      const { parentEmail, studentName } = req.body;

      if (!studentId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!parentEmail || !studentName) {
        return res.status(400).json({
          error: 'Parent email and student name are required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Get or create link code for this student
      const linkCode = await getOrCreateLinkCode(studentId);

      // Initialize email service if not already done
      await emailService.initialize();

      // Send email
      const result = await emailService.sendLinkCodeEmail(
        parentEmail,
        studentName,
        linkCode
      );

      if (!result.success) {
        return res.status(500).json({
          error: result.error || 'Failed to send email'
        });
      }

      res.json({
        success: true,
        message: `Link code sent to ${parentEmail}`,
        previewUrl: result.previewUrl, // For testing with Ethereal
      });
    } catch (error: any) {
      console.error('Send Link Code Email Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to send email'
      });
    }
  }

  /**
   * Get all linked children for a parent
   */
  async getLinkedChildren(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;

      // Get linked children from database
      const linkRepository = AppDataSource.getRepository(ParentChildLink);
      const userRepository = AppDataSource.getRepository(User);

      const links = await linkRepository.find({
        where: { parent_id: parentId, is_active: true },
      });

      const children = await Promise.all(links.map(async (link) => {
        const student = await userRepository.findOne({ where: { id: link.student_id } });

        if (!student) return null;

        // Get homework stats
        const childHomework = Array.from(homeworkStore.values())
          .filter(hw => hw.studentId === student.id);

        const completedHomework = childHomework.filter(hw => hw.status === 'completed').length;
        const pendingHomework = childHomework.filter(hw => hw.status === 'pending').length;

        return {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          linkCode: link.link_code,
          linkedAt: link.linked_at,
          stats: {
            homeworkCompletion: childHomework.length > 0
              ? Math.round((completedHomework / childHomework.length) * 100)
              : 0,
            averageScore: 0, // TODO: Calculate from actual scores
            totalPoints: 0, // TODO: Get from gamification
            studyTime: 0, // TODO: Track study time
          },
        };
      }));

      // Filter out null entries
      const validChildren = children.filter(child => child !== null);

      res.json({
        children: validChildren,
        total: validChildren.length,
      });
    } catch (error: any) {
      console.error('Get Linked Children Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get linked children' });
    }
  }

  /**
   * Get child's homework
   */
  async getChildHomework(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;
      const { studentId } = req.params;

      // Check if parent has access to this child via database
      const linkRepository = AppDataSource.getRepository(ParentChildLink);
      const link = await linkRepository.findOne({
        where: {
          parent_id: parentId,
          student_id: studentId,
          is_active: true,
        },
      });

      if (!link) {
        return res.status(403).json({ error: 'You do not have access to this student' });
      }

      // Get all homework for this child
      const homework = Array.from(homeworkStore.values())
        .filter(hw => hw.studentId === studentId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.json({
        studentId,
        homework,
        total: homework.length,
      });
    } catch (error: any) {
      console.error('Get Child Homework Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get homework' });
    }
  }

  /**
   * Get real-time notifications
   */
  async getNotifications(_req: any, res: Response): Promise<any> {
    try {
      const notifications = [
        {
          id: '1',
          type: 'homework_completed',
          studentName: 'John Doe',
          message: 'Completed Math Assignment',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '2',
          type: 'achievement',
          studentName: 'John Doe',
          message: 'Earned "Science Star" badge',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '3',
          type: 'concern',
          studentName: 'John Doe',
          message: 'Homework overdue: English Essay',
          timestamp: new Date(),
          read: false,
          priority: 'high',
        },
      ];

      res.json({ notifications });
    } catch (error: any) {
      console.error('Get Notifications Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get notifications' });
    }
  }
}

export const parentController = new ParentController();
