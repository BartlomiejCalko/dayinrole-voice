import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getSubscriptionByUserId, updateSubscriptionStatus } from '@/lib/subscription/queries';
import { stripe } from '@/lib/stripe/server';

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

    // Cancel the subscription in Stripe (at period end)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local database
    await updateSubscriptionStatus(
      subscription.stripe_subscription_id,
      subscription.status, // Keep current status but mark for cancellation
      { cancel_at_period_end: true }
    );

    return Response.json({ 
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period' 
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
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 