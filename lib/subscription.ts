import { createServiceClient } from '@/utils/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';
import { getIsAdminByUserId } from '@/lib/auth/roles';

export const getUserSubscriptionStatus = async (userId: string): Promise<{
  isFreePlan: boolean;
  planId: string;
  subscription: UserSubscription | null;
  limits: SubscriptionLimits;
}> => {
  try {
    const supabase = createServiceClient();
    
    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      // User has no active subscription - default to free plan
      const freePlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'free');
      return {
        isFreePlan: true,
        planId: 'free',
        subscription: null,
        limits: {
          dayInRoleLimit: freePlan?.dayInRoleLimit || 0,
          dayInRoleUsed: 0,
          interviewLimit: freePlan?.interviewLimit || 0,
          interviewsUsed: 0,
          questionsPerInterview: freePlan?.questionsPerInterview || 3,
          canGenerateDayInRole: false,
          canGenerateInterview: false
        }
      };
    }

    // Get user's current usage
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('period_end', new Date().toISOString())
      .single();

    const currentUsage = usage || {
      dayinrole_used: 0,
      interviews_used: 0
    };

    // Find the subscription plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_id);
    const isFreePlan = subscription.plan_id === 'free';

    const limits: SubscriptionLimits = {
      dayInRoleLimit: plan?.dayInRoleLimit || 0,
      dayInRoleUsed: currentUsage.dayinrole_used || 0,
      interviewLimit: plan?.interviewLimit || 0,
      interviewsUsed: currentUsage.interviews_used || 0,
      questionsPerInterview: plan?.questionsPerInterview || 3,
      canGenerateDayInRole: !isFreePlan && (currentUsage.dayinrole_used || 0) < (plan?.dayInRoleLimit || 0),
      canGenerateInterview: !isFreePlan && (currentUsage.interviews_used || 0) < (plan?.interviewLimit || 0)
    };

    return {
      isFreePlan,
      planId: subscription.plan_id,
      subscription,
      limits
    };

  } catch (error) {
    console.error('Error checking subscription status:', error);
    // Default to free plan on error
    const freePlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'free');
    return {
      isFreePlan: true,
      planId: 'free',
      subscription: null,
      limits: {
        dayInRoleLimit: freePlan?.dayInRoleLimit || 0,
        dayInRoleUsed: 0,
        interviewLimit: freePlan?.interviewLimit || 0,
        interviewsUsed: 0,
        questionsPerInterview: freePlan?.questionsPerInterview || 3,
        canGenerateDayInRole: false,
        canGenerateInterview: false
      }
    };
  }
};

export const checkSubscriptionLimits = async (userId: string, action: 'dayinrole' | 'interview'): Promise<{
  allowed: boolean;
  reason?: string;
  planId: string;
}> => {
  // Admins bypass all limits
  try {
    if (await getIsAdminByUserId(userId)) {
      return { allowed: true, planId: 'admin' };
    }
  } catch {}

  const { isFreePlan, planId, limits } = await getUserSubscriptionStatus(userId);

  if (isFreePlan) {
    return {
      allowed: false,
      reason: 'Free plan users can only view examples. Please upgrade to create your own Day-in-Role experiences.',
      planId
    };
  }

  if (action === 'dayinrole' && !limits.canGenerateDayInRole) {
    return {
      allowed: false,
      reason: `You have reached your monthly limit of ${limits.dayInRoleLimit} Day-in-Role generations. Please upgrade your plan or wait for the next billing cycle.`,
      planId
    };
  }

  if (action === 'interview' && !limits.canGenerateInterview) {
    return {
      allowed: false,
      reason: `You have reached your monthly limit of ${limits.interviewLimit} interview generations. Please upgrade your plan or wait for the next billing cycle.`,
      planId
    };
  }

  return {
    allowed: true,
    planId
  };
}; 