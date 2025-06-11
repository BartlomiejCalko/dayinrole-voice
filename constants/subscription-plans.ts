export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 12,
    dayInRoleLimit: 10,
    interviewLimit: 1,
    questionsPerInterview: 3,
    stripeProductId: 'prod_basic', // Update this with real product ID from Stripe
    stripePriceId: 'price_basic' // Update this with real price ID from Stripe
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 20,
    dayInRoleLimit: 20,
    interviewLimit: 3,
    questionsPerInterview: 10,
    stripeProductId: 'prod_premium', // Update this with real product ID from Stripe
    stripePriceId: 'price_premium' // Update this with real price ID from Stripe
  }
]; 