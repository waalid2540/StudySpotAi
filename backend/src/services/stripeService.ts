import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_monthly',
    name: 'Basic Monthly',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited AI Homework Help',
      'AI Tutor Chat',
      'Quiz Generator',
      'Basic Analytics',
      'Gamification Features',
    ],
    stripePriceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || '',
  },
  {
    id: 'basic_yearly',
    name: 'Basic Yearly',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited AI Homework Help',
      'AI Tutor Chat',
      'Quiz Generator',
      'Basic Analytics',
      'Gamification Features',
      '2 Months Free!',
    ],
    stripePriceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID || '',
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 19.99,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Priority AI Support',
      'Advanced Analytics',
      'Parent Dashboard',
      'Progress Reports',
      'Custom Study Plans',
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 199.99,
    interval: 'year',
    features: [
      'Everything in Basic',
      'Priority AI Support',
      'Advanced Analytics',
      'Parent Dashboard',
      'Progress Reports',
      'Custom Study Plans',
      '2 Months Free!',
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
  },
];

class StripeService {
  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    userEmail: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
    });

    return session;
  }

  /**
   * Create a customer portal session for managing subscriptions
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Get all plans
   */
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Get plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  }
}

export default new StripeService();
