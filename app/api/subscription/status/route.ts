import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getUserSubscriptionStatus } from '@/lib/subscription';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();
    const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
    
    // Add cache-busting headers
    const response = Response.json({ 
      subscription: subscriptionStatus.subscription,
      isFreePlan: subscriptionStatus.isFreePlan,
      planId: subscriptionStatus.planId,
      limits: subscriptionStatus.limits,
      hasActiveSubscription: subscriptionStatus.subscription?.status === 'active',
      timestamp: Date.now() // Add timestamp to ensure fresh data
    });
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
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