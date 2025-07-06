import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getSubscriptionByUserId, updateSubscriptionByUserId } from '@/lib/subscription/queries';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    const subscription = await getSubscriptionByUserId(user.uid);
    
    if (!subscription) {
      return Response.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'active') {
      return Response.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Handle Clerk subscription cancellation
    console.log('Handling Clerk subscription cancellation for user:', user.uid);
    
    // For Clerk subscriptions, we can't cancel through API
    // We'll mark it for cancellation in our database and inform the user
    await updateSubscriptionByUserId(user.uid, {
      cancel_at_period_end: true,
      // Note: User will need to cancel in Clerk billing dashboard
    });

    return Response.json({ 
      success: true,
      message: 'Cancellation request processed. Please complete cancellation in your account billing settings.',
      type: 'clerk',
      requiresManualCancellation: true,
      instructions: 'To complete the cancellation, please go to your account settings and cancel your subscription in the billing section.'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 