import { Router } from 'express';
import { authController } from '../controllers/authController';
import { homeworkController } from '../controllers/homeworkController';
import { aiController } from '../controllers/aiController';
import { parentController } from '../controllers/parentController';
import { gamificationController } from '../controllers/gamificationController';
import { authenticateUser } from '../middleware/auth';
import stripeRoutes from './stripe';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Root
 *     description: Returns API information and available endpoints
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', (_req, res) => {
  res.json({
    message: 'Learning Platform API - Enterprise Grade',
    version: process.env.API_VERSION || 'v1',
    status: 'operational',
    features: [
      'AI-Powered Homework Help',
      'Real-Time Parent Monitoring',
      'Personalized Learning Paths',
      'Gamification & Rewards',
      'Live Notifications',
      'Performance Analytics',
    ],
    endpoints: {
      docs: '/api/docs',
      health: '/health',
      auth: '/api/v1/auth',
      homework: '/api/v1/homework',
      ai: '/api/v1/ai',
      parents: '/api/v1/parents',
      gamification: '/api/v1/gamification',
      stripe: '/api/v1/stripe',
    },
  });
});

// ============================================================
// AUTHENTICATION ROUTES (Public)
// ============================================================
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));
router.get('/auth/profile', authenticateUser, authController.getProfile.bind(authController));
router.put('/auth/profile', authenticateUser, authController.updateProfile.bind(authController));

// ============================================================
// HOMEWORK ROUTES (Protected)
// ============================================================
router.post('/homework', authenticateUser, homeworkController.create.bind(homeworkController));
router.get('/homework', authenticateUser, homeworkController.getAll.bind(homeworkController));
router.get('/homework/:id', authenticateUser, homeworkController.getById.bind(homeworkController));
router.put('/homework/:id', authenticateUser, homeworkController.update.bind(homeworkController));
router.post('/homework/:id/complete', authenticateUser, homeworkController.complete.bind(homeworkController));
router.delete('/homework/:id', authenticateUser, homeworkController.delete.bind(homeworkController));

// ============================================================
// AI ASSISTANT ROUTES (Protected)
// ============================================================
router.post('/ai/solve', authenticateUser, aiController.solveHomework.bind(aiController));
router.post('/ai/quiz', authenticateUser, aiController.generateQuiz.bind(aiController));
router.post('/ai/chat', authenticateUser, aiController.chat.bind(aiController));
router.get('/ai/chat/:sessionId', authenticateUser, aiController.getChatHistory.bind(aiController));
router.post('/ai/analyze-image', authenticateUser, aiController.analyzeImage.bind(aiController));

// ============================================================
// PARENT MONITORING ROUTES (Protected)
// ============================================================
router.get('/parents/dashboard', authenticateUser, parentController.getDashboard.bind(parentController));
router.get('/parents/insights/:studentId', authenticateUser, parentController.getStudentInsights.bind(parentController));
router.get('/parents/reports/:studentId', authenticateUser, parentController.getProgressReports.bind(parentController));
router.post('/parents/link-child', authenticateUser, parentController.linkChild.bind(parentController));
router.get('/parents/notifications', authenticateUser, parentController.getNotifications.bind(parentController));

// ============================================================
// GAMIFICATION ROUTES (Protected)
// ============================================================
router.get('/gamification/points', authenticateUser, gamificationController.getPoints.bind(gamificationController));
router.post('/gamification/points', authenticateUser, gamificationController.awardPoints.bind(gamificationController));
router.get('/gamification/badges', authenticateUser, gamificationController.getAllBadges.bind(gamificationController));
router.get('/gamification/badges/earned', authenticateUser, gamificationController.getEarnedBadges.bind(gamificationController));
router.post('/gamification/badges/award', authenticateUser, gamificationController.awardBadge.bind(gamificationController));
router.get('/gamification/leaderboard', authenticateUser, gamificationController.getLeaderboard.bind(gamificationController));
router.get('/gamification/rewards', authenticateUser, gamificationController.getRewards.bind(gamificationController));
router.post('/gamification/rewards/redeem', authenticateUser, gamificationController.redeemReward.bind(gamificationController));

// ============================================================
// STRIPE SUBSCRIPTION ROUTES
// ============================================================
router.use('/stripe', stripeRoutes);

export default router;
