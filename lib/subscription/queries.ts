import { db } from '@/firebase/admin';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';

export const getSubscriptionByUserId = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const subscriptionRef = db.collection('subscriptions').where('userId', '==', userId);
    const snapshot = await subscriptionRef.get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserSubscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const getUsageTracking = async (userId: string): Promise<UsageTracking | null> => {
  try {
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usageRef = db.collection('usage_tracking')
      .where('userId', '==', userId)
      .where('periodStart', '==', currentPeriodStart.toISOString());
    
    const snapshot = await usageRef.get();
    
    if (snapshot.empty) {
      // Create new usage tracking for current period
      const newUsage: Partial<UsageTracking> = {
        userId,
        periodStart: currentPeriodStart.toISOString(),
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
        dayInRoleUsed: 0,
        interviewsUsed: 0,
        resetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      };
      
      const docRef = await db.collection('usage_tracking').add(newUsage);
      return { id: docRef.id, ...newUsage } as UsageTracking;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UsageTracking;
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
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }
    
    const currentUsage = usage || {
      dayInRoleUsed: 0,
      interviewsUsed: 0,
    };
    
    return {
      dayInRoleLimit: plan.dayInRoleLimit,
      dayInRoleUsed: currentUsage.dayInRoleUsed,
      interviewLimit: plan.interviewLimit,
      interviewsUsed: currentUsage.interviewsUsed,
      questionsPerInterview: plan.questionsPerInterview,
      canGenerateDayInRole: currentUsage.dayInRoleUsed < plan.dayInRoleLimit,
      canGenerateInterview: currentUsage.interviewsUsed < plan.interviewLimit,
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
    
    await db.collection('usage_tracking').doc(usage.id).update({
      dayInRoleUsed: usage.dayInRoleUsed + 1,
    });
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
    
    await db.collection('usage_tracking').doc(usage.id).update({
      interviewsUsed: usage.interviewsUsed + 1,
    });
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
    const subscriptionData: Partial<UserSubscription> = {
      userId,
      planId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await db.collection('subscriptions').add(subscriptionData);
    return docRef.id;
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
    const subscriptionRef = db.collection('subscriptions')
      .where('stripeSubscriptionId', '==', stripeSubscriptionId);
    
    const snapshot = await subscriptionRef.get();
    
    if (snapshot.empty) {
      throw new Error('Subscription not found');
    }
    
    const doc = snapshot.docs[0];
    await doc.ref.update({
      status,
      updatedAt: new Date().toISOString(),
      ...updates,
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}; 