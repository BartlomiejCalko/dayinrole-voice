import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getUserSubscriptionStatus } from '@/lib/subscription';
import { getSubscriptionByUserId } from '@/lib/subscription/queries';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    console.log('Subscription refresh requested by user:', user.uid);
    
    // Get current subscription from database for logging
    const dbSubscription = await getSubscriptionByUserId(user.uid);
    console.log('Current subscription in database:', {
      id: dbSubscription?.id,
      planId: dbSubscription?.plan_id,
      status: dbSubscription?.status,
      hasStripeIds: !!(dbSubscription?.stripe_subscription_id && dbSubscription?.stripe_customer_id)
    });
    
    // Force refresh subscription status
    const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
    console.log('Computed subscription status:', {
      isFreePlan: subscriptionStatus.isFreePlan,
      planId: subscriptionStatus.planId,
      hasSubscription: !!subscriptionStatus.subscription
    });
    
    return Response.json({ 
      success: true,
      subscription: subscriptionStatus.subscription,
      isFreePlan: subscriptionStatus.isFreePlan,
      planId: subscriptionStatus.planId,
      limits: subscriptionStatus.limits,
      hasActiveSubscription: subscriptionStatus.subscription?.status === 'active',
      debug: {
        databasePlanId: dbSubscription?.plan_id,
        databaseStatus: dbSubscription?.status,
        hasStripeIds: !!(dbSubscription?.stripe_subscription_id && dbSubscription?.stripe_customer_id)
      }
    });
  } catch (error) {
    console.error('Error refreshing subscription status:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 