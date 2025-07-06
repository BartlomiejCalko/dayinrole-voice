import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getSubscriptionByUserId, updateSubscriptionByUserId } from '@/lib/subscription/queries';
import { stripe } from '@/lib/stripe/server';
import { getUserSubscriptionStatus } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    console.log('Manual subscription sync requested by user:', user.uid);
    
    // Get current subscription from database
    const currentSubscription = await getSubscriptionByUserId(user.uid);
    
    if (!currentSubscription) {
      return Response.json(
        { error: 'No subscription found for user' },
        { status: 404 }
      );
    }

    // If the subscription has Stripe IDs, sync with Stripe
    if (currentSubscription.stripe_subscription_id && currentSubscription.stripe_customer_id) {
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
        
        // Get updated subscription status
        const updatedStatus = await getUserSubscriptionStatus(user.uid);
        
        return Response.json({
          success: true,
          message: 'Subscription synced successfully with Stripe',
          data: {
            subscription: updatedStatus.subscription,
            isFreePlan: updatedStatus.isFreePlan,
            planId: updatedStatus.planId,
            limits: updatedStatus.limits,
            syncedFromStripe: true
          }
        });
        
      } catch (stripeError: any) {
        console.error('Error syncing with Stripe:', stripeError);
        
        // If subscription not found in Stripe, might need to handle differently
        if (stripeError.code === 'resource_missing') {
          console.log('Subscription not found in Stripe, may have been deleted');
          
          // Update to canceled status
          await updateSubscriptionByUserId(user.uid, {
            status: 'canceled',
            cancel_at_period_end: true
          });
          
          return Response.json({
            success: true,
            message: 'Subscription was not found in Stripe and has been marked as canceled',
            data: {
              subscription: null,
              isFreePlan: true,
              planId: 'free',
              limits: {
                dayInRoleLimit: 0,
                dayInRoleUsed: 0,
                interviewLimit: 0,
                interviewsUsed: 0,
                questionsPerInterview: 3,
                canGenerateDayInRole: false,
                canGenerateInterview: false
              },
              syncedFromStripe: false
            }
          });
        }
        
        throw stripeError;
      }
    } else {
      // No Stripe IDs, this is likely a free subscription
      console.log('No Stripe IDs found, this appears to be a free subscription');
      
      // Get current subscription status
      const currentStatus = await getUserSubscriptionStatus(user.uid);
      
      return Response.json({
        success: true,
        message: 'Current subscription status retrieved (no Stripe sync needed)',
        data: {
          subscription: currentStatus.subscription,
          isFreePlan: currentStatus.isFreePlan,
          planId: currentStatus.planId,
          limits: currentStatus.limits,
          syncedFromStripe: false
        }
      });
    }
    
  } catch (error) {
    console.error('Error syncing subscription:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return Response.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
} 