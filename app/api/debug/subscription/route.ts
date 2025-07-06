import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getSubscriptionByUserId } from '@/lib/subscription/queries';
import { getUserSubscriptionStatus } from '@/lib/subscription';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();
    
    // Get subscription from database
    const dbSubscription = await getSubscriptionByUserId(user.uid);
    
    // Get subscription status (computed)
    const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
    
    // Get usage data
    const supabase = createServiceClient();
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });
    
    let stripeData = null;
    let stripeError = null;
    
    // Try to get Stripe data if subscription has Stripe IDs
    if (dbSubscription?.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id);
        stripeData = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          customer: stripeSubscription.customer,
          current_period_start: stripeSubscription.current_period_start,
          current_period_end: stripeSubscription.current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          metadata: stripeSubscription.metadata,
          items: stripeSubscription.items.data.map(item => ({
            id: item.id,
            price: {
              id: item.price.id,
              nickname: item.price.nickname,
              unit_amount: item.price.unit_amount,
              currency: item.price.currency,
              recurring: item.price.recurring
            }
          }))
        };
      } catch (error: any) {
        stripeError = {
          code: error.code,
          message: error.message,
          type: error.type
        };
      }
    }
    
    // Try to get customer data if available
    let customerData = null;
    if (dbSubscription?.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(dbSubscription.stripe_customer_id);
        customerData = {
          id: customer.id,
          email: (customer as any).email,
          created: customer.created,
          metadata: customer.metadata
        };
      } catch (error) {
        // Customer retrieval failed, but don't fail the whole request
        console.log('Could not retrieve customer data:', error);
      }
    }
    
    return Response.json({
      success: true,
      data: {
        userId: user.uid,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        
        // Database subscription
        databaseSubscription: dbSubscription,
        
        // Computed subscription status
        subscriptionStatus: {
          isFreePlan: subscriptionStatus.isFreePlan,
          planId: subscriptionStatus.planId,
          limits: subscriptionStatus.limits,
          subscription: subscriptionStatus.subscription
        },
        
        // Usage data
        usage: usage || [],
        
        // Stripe data
        stripeSubscription: stripeData,
        stripeCustomer: customerData,
        stripeError: stripeError,
        
        // Diagnostics
        diagnostics: {
          hasStripeSubscriptionId: !!dbSubscription?.stripe_subscription_id,
          hasStripeCustomerId: !!dbSubscription?.stripe_customer_id,
          stripeDataAvailable: !!stripeData,
          stripeErrorPresent: !!stripeError,
          isFreePlanInDb: dbSubscription?.plan_id === 'free',
          subscriptionStatus: dbSubscription?.status,
          hasNullStripeIds: dbSubscription?.stripe_subscription_id === null && dbSubscription?.stripe_customer_id === null,
          
          // Potential issues
          potentialIssues: [
            ...(dbSubscription?.plan_id === 'free' && dbSubscription?.stripe_subscription_id === null ? 
              ['User appears to have free plan but might have paid subscription that wasn\'t processed'] : []),
            ...(dbSubscription?.stripe_subscription_id && stripeError?.code === 'resource_missing' ? 
              ['Stripe subscription ID exists in database but not found in Stripe'] : []),
            ...(dbSubscription?.status !== 'active' ? 
              [`Subscription status is ${dbSubscription?.status} instead of active`] : []),
            ...(subscriptionStatus.isFreePlan && stripeData?.status === 'active' ? 
              ['Stripe shows active subscription but user is detected as free plan'] : [])
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('Error in subscription debug endpoint:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 