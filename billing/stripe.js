import Stripe from 'stripe';

const plans = [
  {
    id: 'free',
    title: 'FREE',
    price: 0,
    description: 'Basic access with one location and limited bandwidth',
    features: ['1 server location', '5 GB / month', 'WireGuard protocol', 'Basic support'],
  },
  {
    id: 'pro',
    title: 'PRO',
    price: 4.99,
    description: 'Unlimited VPN bandwidth, premium locations, and priority support',
    features: ['50+ server locations', 'Unlimited bandwidth', 'All protocols', 'Kill switch + IP leak guard', 'Priority support'],
    popular: true,
  },
  {
    id: 'team',
    title: 'TEAM',
    price: 12.0,
    description: 'Team-ready plan with shared access and administrative controls',
    features: ['Everything in Pro', 'Up to 10 team members', 'Dedicated nodes', 'Admin dashboard', 'SLA guarantee'],
  },
];

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' }) : null;

export function getPricingPlans() {
  return plans;
}

export async function createCheckoutSession(planId, origin) {
  const plan = plans.find(item => item.id === planId);
  if (!plan) {
    throw new Error('Pricing plan not found');
  }

  if (!stripe) {
    return {
      url: `${origin}/?checkout=${planId}`,
      message: 'Stripe is not configured. Use STRIPE_SECRET_KEY to enable checkout.',
      planId,
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `A2 Node ${plan.title}`,
            description: plan.description,
          },
          unit_amount: Math.round(plan.price * 100),
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/?canceled=true`,
  });

  return { url: session.url };
}
