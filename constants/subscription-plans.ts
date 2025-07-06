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
    stripeProductId: null, // Handled by Clerk billing
    stripePriceId: null // Handled by Clerk billing
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 21,
    dayInRoleLimit: 30,
    interviewLimit: 20,
    questionsPerInterview: 20,
    stripeProductId: null, // Handled by Clerk billing
    stripePriceId: null // Handled by Clerk billing
  }
];

// Helper function to get plan by ID
export const getPlanById = (planId: string) => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

// Check if a plan is paid
export const isPaidPlan = (planId: string) => {
  return planId !== 'free';
}; 