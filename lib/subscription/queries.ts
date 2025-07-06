import { createServiceClient } from '@/utils/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';
import { verifyAuth } from '@/lib/auth/verify';
import { ensureUserExists } from '@/lib/auth/user-management';

export const getSubscriptionByUserId = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const getUsageTracking = async (userId: string): Promise<UsageTracking | null> => {
  try {
    const supabase = createServiceClient();
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period_start', currentPeriodStart.toISOString())
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Ensure user exists in database before creating usage tracking (fallback for existing users)
      try {
        const authUser = await verifyAuth();
        await ensureUserExists(authUser);
        
        // Also ensure they have a free subscription if they don't have any
        const existingSubscription = await getSubscriptionByUserId(userId);
        if (!existingSubscription) {
          const freeSubscription = {
            user_id: userId,
            plan_id: 'free',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            status: 'active' as const,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            cancel_at_period_end: false,
          };
          
          await supabase.from('subscriptions').upsert(freeSubscription, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });
          console.log('Created fallback free subscription for existing user:', userId);
        }
      } catch (userError) {
        console.error('Error ensuring user exists for usage tracking:', userError);
        return null;
      }
      
      // Create new usage tracking for current period
      const newUsage = {
        user_id: userId,
        period_start: currentPeriodStart.toISOString(),
        period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
        dayinrole_used: 0,
        interviews_used: 0,
        reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('usage_tracking')
        .insert(newUsage)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating usage tracking:', insertError);
        return null;
      }
      
      return newData;
    }
    
    if (error) {
      console.error('Error fetching usage tracking:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching usage tracking:', error);
    return null;
  }
};

export const checkSubscriptionLimits = async (userId: string): Promise<SubscriptionLimits> => {
  try {
    const subscription = await getSubscriptionByUserId(userId);
    const usage = await getUsageTracking(userId);
    
    if (!subscription || subscription.status !== 'active') {
      return {
        dayInRoleLimit: 0,
        dayInRoleUsed: 0,
        interviewLimit: 0,
        interviewsUsed: 0,
        questionsPerInterview: 0,
        canGenerateDayInRole: false,
        canGenerateInterview: false,
      };
    }
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_id);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }
    
    const currentUsage = usage || {
      dayinrole_used: 0,
      interviews_used: 0,
    };
    
    return {
      dayInRoleLimit: plan.dayInRoleLimit,
      dayInRoleUsed: currentUsage.dayinrole_used,
      interviewLimit: plan.interviewLimit,
      interviewsUsed: currentUsage.interviews_used,
      questionsPerInterview: plan.questionsPerInterview,
      canGenerateDayInRole: currentUsage.dayinrole_used < plan.dayInRoleLimit,
      canGenerateInterview: currentUsage.interviews_used < plan.interviewLimit,
    };
  } catch (error) {
    console.error('Error checking subscription limits:', error);
    // Return restrictive limits on error
    return {
      dayInRoleLimit: 0,
      dayInRoleUsed: 0,
      interviewLimit: 0,
      interviewsUsed: 0,
      questionsPerInterview: 0,
      canGenerateDayInRole: false,
      canGenerateInterview: false,
    };
  }
};

export const incrementDayInRoleUsage = async (userId: string): Promise<void> => {
  try {
    const usage = await getUsageTracking(userId);
    if (!usage) {
      throw new Error('Usage tracking not found');
    }
    
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('usage_tracking')
      .update({
        dayinrole_used: usage.dayinrole_used + 1,
      })
      .eq('id', usage.id);
    
    if (error) {
      console.error('Error incrementing day in role usage:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error incrementing day in role usage:', error);
    throw error;
  }
};

export const incrementInterviewUsage = async (userId: string): Promise<void> => {
  try {
    const usage = await getUsageTracking(userId);
    if (!usage) {
      throw new Error('Usage tracking not found');
    }
    
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('usage_tracking')
      .update({
        interviews_used: usage.interviews_used + 1,
      })
      .eq('id', usage.id);
    
    if (error) {
      console.error('Error incrementing interview usage:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error incrementing interview usage:', error);
    throw error;
  }
};

export const createSubscription = async (
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  planId: string
): Promise<string> => {
  try {
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancel_at_period_end: false,
    };
    
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscriptionStatus = async (
  stripeSubscriptionId: string,
  status: UserSubscription['status'],
  updates: Partial<UserSubscription> = {}
): Promise<void> => {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...updates,
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);
    
    if (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

export const updateSubscriptionByUserId = async (
  userId: string,
  updates: Partial<UserSubscription>
): Promise<void> => {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('subscriptions')
      .update({
        updated_at: new Date().toISOString(),
        ...updates,
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating subscription by user ID:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating subscription by user ID:', error);
    throw error;
  }
}; 