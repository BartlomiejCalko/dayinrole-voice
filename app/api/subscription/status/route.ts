import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getUserSubscriptionStatus } from '@/lib/subscription';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();
    const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
    
    return Response.json({ 
      subscription: subscriptionStatus.subscription,
      isFreePlan: subscriptionStatus.isFreePlan,
      planId: subscriptionStatus.planId,
      limits: subscriptionStatus.limits,
      hasActiveSubscription: subscriptionStatus.subscription?.status === 'active' 
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    
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