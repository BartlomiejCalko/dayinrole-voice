export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    dayInRoleLimit: 0, // Can only see examples
    interviewLimit: 0, // Can only see examples
    questionsPerInterview: 3, // For examples only
    stripeProductId: null,
    stripePriceId: null
  },
  {
    id: 'start',
    name: 'Start Plan',
    price: 12,
    dayInRoleLimit: 10,
    interviewLimit: 5,
    questionsPerInterview: 5,
    stripeProductId: 'prod_start', // Update this with real product ID from Stripe
    stripePriceId: 'price_1234567890abcdef_start' // Update this with real price ID from Stripe
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 21,
    dayInRoleLimit: 30,
    interviewLimit: 20,
    questionsPerInterview: 20,
    stripeProductId: 'prod_pro', // Update this with real product ID from Stripe
    stripePriceId: 'price_1234567890abcdef_pro' // Update this with real price ID from Stripe
  }
]; 