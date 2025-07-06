import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getSubscriptionByUserId, updateSubscriptionByUserId } from '@/lib/subscription/queries';
import { stripe } from '@/lib/stripe/server';
import { getUserSubscriptionStatus } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    
    // Get current subscription from database
    const currentSubscription = await getSubscriptionByUserId(user.uid);
    
    if (!currentSubscription) {
      return Response.json({ 
        success: false, 
        error: 'No subscription found in database' 
      }, { status: 404 });
    }

    // If subscription has Stripe IDs, sync with Stripe
    if (currentSubscription.stripe_subscription_id) {
      console.log('Syncing subscription with Stripe:', currentSubscription.stripe_subscription_id);
      
      try {
        // Get subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(currentSubscription.stripe_subscription_id);
        
        // Get the plan ID from Stripe metadata or items
        let planId = stripeSubscription.metadata?.planId;
        
        // If no plan ID in metadata, try to determine from price ID
        if (!planId && stripeSubscription.items.data.length > 0) {
          const priceId = stripeSubscription.items.data[0].price.id;
          console.log('No plan ID in metadata, using price ID:', priceId);
          
          // Map price ID to plan ID using the subscription plans constants
          const { SUBSCRIPTION_PLANS } = await import('@/constants/subscription-plans');
          const matchingPlan = SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId);
          
          if (matchingPlan) {
            planId = matchingPlan.id;
          } else {
            // Fallback pattern matching
            if (priceId.includes('start')) {
              planId = 'start';
            } else if (priceId.includes('pro')) {
              planId = 'pro';
            } else {
              planId = 'start'; // Default fallback
            }
          }
        }

        // Update subscription with Stripe data
        const updateData = {
          plan_id: planId || currentSubscription.plan_id,
          status: stripeSubscription.status as any,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        };

        await updateSubscriptionByUserId(user.uid, updateData);
        console.log('Subscription synced successfully with Stripe data');
        
        return Response.json({ 
          success: true, 
          message: 'Subscription synced with Stripe successfully',
          subscription: {
            ...currentSubscription,
            ...updateData
          }
        });
        
      } catch (stripeError: any) {
        console.error('Error syncing with Stripe:', stripeError);
        return Response.json({ 
          success: false, 
          error: `Failed to sync with Stripe: ${stripeError.message}` 
        }, { status: 500 });
      }
    } else {
      // No Stripe subscription ID - this is likely a free plan or manual subscription
      console.log('No Stripe subscription ID found for user:', user.uid);
      return Response.json({ 
        success: false, 
        error: 'No Stripe subscription ID found. This subscription cannot be synced with Stripe.' 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 