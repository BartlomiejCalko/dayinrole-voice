import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getUserSubscriptionStatus } from '@/lib/subscription';
import { getSubscriptionByUserId } from '@/lib/subscription/queries';

export async function GET(req: NextRequest) {
  try {
    const authUser = await verifyAuth();
    
    // Get subscription using both methods
    const subscriptionStatus = await getUserSubscriptionStatus(authUser.uid);
    const rawSubscription = await getSubscriptionByUserId(authUser.uid);
    
    return Response.json({
      success: true,
      data: {
        userId: authUser.uid,
        rawSubscription,
        subscriptionStatus: {
          isFreePlan: subscriptionStatus.isFreePlan,
          planId: subscriptionStatus.planId,
          subscription: subscriptionStatus.subscription,
          limits: subscriptionStatus.limits
        }
      }
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 