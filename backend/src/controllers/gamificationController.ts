import { Response } from 'express';
import { Badge } from '../types';

// Mock storage for gamification data
const studentPoints: Map<string, number> = new Map();
const studentBadges: Map<string, Badge[]> = new Map();

const availableBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first homework assignment',
    imageUrl: '/badges/first-steps.png',
    points: 10,
    category: 'beginner',
  },
  {
    id: '2',
    name: 'Math Master',
    description: 'Complete 10 math assignments',
    imageUrl: '/badges/math-master.png',
    points: 100,
    category: 'math',
  },
  {
    id: '3',
    name: 'Quiz Champion',
    description: 'Score 90% or higher on 5 quizzes',
    imageUrl: '/badges/quiz-champion.png',
    points: 150,
    category: 'quiz',
  },
  {
    id: '4',
    name: 'Science Star',
    description: 'Excel in science subjects',
    imageUrl: '/badges/science-star.png',
    points: 100,
    category: 'science',
  },
  {
    id: '5',
    name: 'Consistent Learner',
    description: 'Study for 7 consecutive days',
    imageUrl: '/badges/consistent-learner.png',
    points: 200,
    category: 'achievement',
  },
];

export class GamificationController {
  /**
   * Get student points and rank
   */
  async getPoints(req: any, res: Response): Promise<any> {
    try {
      const studentId = req.user?.uid;
      const points = studentPoints.get(studentId) || 0;

      // Calculate rank (mock)
      const allPoints = Array.from(studentPoints.values());
      allPoints.sort((a, b) => b - a);
      const rank = allPoints.indexOf(points) + 1 || 1;

      res.json({
        studentId,
        totalPoints: points,
        rank,
        level: Math.floor(points / 100) + 1,
        pointsToNextLevel: 100 - (points % 100),
      });
    } catch (error: any) {
      console.error('Get Points Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get points' });
    }
  }

  /**
   * Award points to student
   */
  async awardPoints(req: any, res: Response): Promise<any> {
    try {
      const { studentId, points, reason } = req.body;

      if (!studentId || !points) {
        return res.status(400).json({ error: 'Student ID and points are required' });
      }

      const currentPoints = studentPoints.get(studentId) || 0;
      const newPoints = currentPoints + points;
      studentPoints.set(studentId, newPoints);

      // Check for level up
      const oldLevel = Math.floor(currentPoints / 100) + 1;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const leveledUp = newLevel > oldLevel;

      // Emit real-time event
      const io = req.app.get('io');
      if (io) {
        io.to(`student-${studentId}`).emit('points-awarded', {
          points,
          totalPoints: newPoints,
          reason,
          leveledUp,
          newLevel,
        });
      }

      res.json({
        message: 'Points awarded successfully',
        totalPoints: newPoints,
        pointsAwarded: points,
        reason,
        leveledUp,
        level: newLevel,
      });
    } catch (error: any) {
      console.error('Award Points Error:', error);
      res.status(500).json({ error: error.message || 'Failed to award points' });
    }
  }

  /**
   * Get all badges
   */
  async getAllBadges(req: any, res: Response): Promise<any> {
    try {
      res.json({
        badges: availableBadges,
        total: availableBadges.length,
      });
    } catch (error: any) {
      console.error('Get All Badges Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get badges' });
    }
  }

  /**
   * Get student's earned badges
   */
  async getEarnedBadges(req: any, res: Response): Promise<any> {
    try {
      const studentId = req.user?.uid;
      const badges = studentBadges.get(studentId) || [];

      res.json({
        studentId,
        badges,
        totalBadges: badges.length,
        availableBadges: availableBadges.length,
        progress: `${badges.length}/${availableBadges.length}`,
      });
    } catch (error: any) {
      console.error('Get Earned Badges Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get earned badges' });
    }
  }

  /**
   * Award badge to student
   */
  async awardBadge(req: any, res: Response): Promise<any> {
    try {
      const { studentId, badgeId } = req.body;

      if (!studentId || !badgeId) {
        return res.status(400).json({ error: 'Student ID and badge ID are required' });
      }

      const badge = availableBadges.find(b => b.id === badgeId);
      if (!badge) {
        return res.status(404).json({ error: 'Badge not found' });
      }

      const earnedBadges = studentBadges.get(studentId) || [];

      // Check if already earned
      if (earnedBadges.some(b => b.id === badgeId)) {
        return res.status(400).json({ error: 'Badge already earned' });
      }

      earnedBadges.push(badge);
      studentBadges.set(studentId, earnedBadges);

      // Award points for badge
      const currentPoints = studentPoints.get(studentId) || 0;
      studentPoints.set(studentId, currentPoints + badge.points);

      // Emit real-time event
      const io = req.app.get('io');
      if (io) {
        io.to(`student-${studentId}`).emit('badge-earned', {
          badge,
          totalBadges: earnedBadges.length,
        });
        io.to(`parent-${studentId}`).emit('child-badge-earned', {
          studentId,
          badge,
        });
      }

      res.json({
        message: 'Badge awarded successfully',
        badge,
        pointsAwarded: badge.points,
        totalBadges: earnedBadges.length,
      });
    } catch (error: any) {
      console.error('Award Badge Error:', error);
      res.status(500).json({ error: error.message || 'Failed to award badge' });
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(req: any, res: Response): Promise<any> {
    try {
      const { limit = 10 } = req.query;

      const leaderboard = Array.from(studentPoints.entries())
        .map(([studentId, points]) => ({
          studentId,
          name: `Student ${studentId.substring(0, 6)}`, // Mock name
          points,
          level: Math.floor(points / 100) + 1,
          badges: (studentBadges.get(studentId) || []).length,
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, Number(limit));

      res.json({
        leaderboard,
        total: studentPoints.size,
      });
    } catch (error: any) {
      console.error('Get Leaderboard Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get leaderboard' });
    }
  }

  /**
   * Get rewards catalog
   */
  async getRewards(req: any, res: Response): Promise<any> {
    try {
      const rewards = [
        {
          id: '1',
          name: '30 Minutes Extra Screen Time',
          description: 'Earn 30 extra minutes of screen time',
          pointsCost: 100,
          category: 'privileges',
          imageUrl: '/rewards/screen-time.png',
        },
        {
          id: '2',
          name: 'Choose Tonight\'s Dinner',
          description: 'Pick what the family has for dinner',
          pointsCost: 150,
          category: 'privileges',
          imageUrl: '/rewards/dinner.png',
        },
        {
          id: '3',
          name: 'Premium Study Guide',
          description: 'Access to advanced study materials',
          pointsCost: 200,
          category: 'educational',
          imageUrl: '/rewards/study-guide.png',
        },
        {
          id: '4',
          name: 'Fun Activity Pass',
          description: 'One fun activity of your choice',
          pointsCost: 250,
          category: 'entertainment',
          imageUrl: '/rewards/fun-pass.png',
        },
      ];

      res.json({
        rewards,
        total: rewards.length,
      });
    } catch (error: any) {
      console.error('Get Rewards Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get rewards' });
    }
  }

  /**
   * Redeem reward
   */
  async redeemReward(req: any, res: Response): Promise<any> {
    try {
      const studentId = req.user?.uid;
      const { rewardId } = req.body;

      if (!rewardId) {
        return res.status(400).json({ error: 'Reward ID is required' });
      }

      // Mock reward data
      const reward = {
        id: rewardId,
        name: 'Sample Reward',
        pointsCost: 100,
      };

      const currentPoints = studentPoints.get(studentId) || 0;

      if (currentPoints < reward.pointsCost) {
        return res.status(400).json({ error: 'Insufficient points' });
      }

      // Deduct points
      studentPoints.set(studentId, currentPoints - reward.pointsCost);

      // Emit event
      const io = req.app.get('io');
      if (io) {
        io.to(`student-${studentId}`).emit('reward-redeemed', {
          reward,
          pointsRemaining: currentPoints - reward.pointsCost,
        });
        io.to(`parent-${studentId}`).emit('child-redeemed-reward', {
          studentId,
          reward,
        });
      }

      res.json({
        message: 'Reward redeemed successfully',
        reward,
        pointsSpent: reward.pointsCost,
        pointsRemaining: currentPoints - reward.pointsCost,
      });
    } catch (error: any) {
      console.error('Redeem Reward Error:', error);
      res.status(500).json({ error: error.message || 'Failed to redeem reward' });
    }
  }
}

export const gamificationController = new GamificationController();
