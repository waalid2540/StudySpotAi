import { Request, Response } from 'express';
import stripeService from '../services/stripeService';
import { AppDataSource } from '../config/database';
import { Subscription, SubscriptionStatus } from '../entities/Subscription';
import { User } from '../entities/User';

export class StripeController {
  /**
   * Get all available subscription plans
   */
  async getPlans(req: Request, res: Response) {
    try {
      const plans = stripeService.getPlans();
      res.json({
        success: true,
        data: { plans },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch subscription plans',
      });
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!userId || !userEmail) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      if (!planId) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID is required',
        });
      }

      const plan = stripeService.getPlan(planId);
      if (!plan) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan ID',
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const successUrl = `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${frontendUrl}/subscription/cancel`;

      const session = await stripeService.createCheckoutSession(
        userId,
        userEmail,
        planId,
        successUrl,
        cancelUrl
      );

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create checkout session',
      });
    }
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const subscription = await subscriptionRepo.findOne({
        where: { userId, status: SubscriptionStatus.ACTIVE },
      });

      if (!subscription || !subscription.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found',
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const returnUrl = `${frontendUrl}/subscription`;

      const session = await stripeService.createPortalSession(
        subscription.stripeCustomerId,
        returnUrl
      );

      res.json({
        success: true,
        data: {
          url: session.url,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create portal session',
      });
    }
  }

  /**
   * Get user's current subscription
   */
  async getCurrentSubscription(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const subscription = await subscriptionRepo.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      res.json({
        success: true,
        data: { subscription },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch subscription',
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const subscription = await subscriptionRepo.findOne({
        where: { userId, status: SubscriptionStatus.ACTIVE },
      });

      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found',
        });
      }

      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);

      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      await subscriptionRepo.save(subscription);

      res.json({
        success: true,
        message: 'Subscription canceled successfully',
        data: { subscription },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel subscription',
      });
    }
  }

  /**
   * Stripe webhook handler
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing stripe signature',
        });
      }

      const event = await stripeService.handleWebhook(req.body, signature);

      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const userRepo = AppDataSource.getRepository(User);

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const userId = session.client_reference_id;
          const planId = session.subscription_data?.metadata?.planId;

          if (userId && planId) {
            // Create or update subscription
            let subscription = await subscriptionRepo.findOne({
              where: { userId },
            });

            if (!subscription) {
              subscription = new Subscription();
              subscription.userId = userId;
            }

            subscription.plan = planId as any;
            subscription.status = SubscriptionStatus.ACTIVE;
            subscription.stripeSubscriptionId = session.subscription;
            subscription.stripeCustomerId = session.customer;

            await subscriptionRepo.save(subscription);
          }
          break;
        }

        case 'customer.subscription.updated': {
          const stripeSubscription = event.data.object as any;
          const subscription = await subscriptionRepo.findOne({
            where: { stripeSubscriptionId: stripeSubscription.id },
          });

          if (subscription) {
            subscription.status = stripeSubscription.status;
            subscription.currentPeriodStart = new Date(
              stripeSubscription.current_period_start * 1000
            );
            subscription.currentPeriodEnd = new Date(
              stripeSubscription.current_period_end * 1000
            );
            await subscriptionRepo.save(subscription);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const stripeSubscription = event.data.object as any;
          const subscription = await subscriptionRepo.findOne({
            where: { stripeSubscriptionId: stripeSubscription.id },
          });

          if (subscription) {
            subscription.status = SubscriptionStatus.CANCELED;
            subscription.canceledAt = new Date();
            await subscriptionRepo.save(subscription);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({
        success: false,
        error: `Webhook Error: ${error.message}`,
      });
    }
  }
}

export default new StripeController();
