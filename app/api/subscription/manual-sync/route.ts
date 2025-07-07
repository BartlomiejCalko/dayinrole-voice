import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { updateSubscriptionByUserId } from '@/lib/subscription/queries';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    console.log('Manual sync for user:', clerkUser.id);
    console.log('User metadata:', {
      publicMetadata: clerkUser.publicMetadata,
      privateMetadata: clerkUser.privateMetadata,
      unsafeMetadata: clerkUser.unsafeMetadata
    });
    
    // Check for subscription data in various metadata fields
    let planId = 'free';
    let hasActiveBilling = false;
    
    // Check various sources for plan information
    const planSources = [
      clerkUser.publicMetadata?.planId,
      clerkUser.publicMetadata?.plan_id,
      clerkUser.publicMetadata?.subscriptionPlan,
      clerkUser.privateMetadata?.planId,
      clerkUser.privateMetadata?.plan_id,
      clerkUser.privateMetadata?.subscriptionPlan,
      clerkUser.unsafeMetadata?.planId,
      clerkUser.unsafeMetadata?.plan_id,
      clerkUser.unsafeMetadata?.subscriptionPlan,
    ];
    
    console.log('Plan sources found:', planSources.filter(Boolean));
    
    // Check for any billing indicators
    const billingIndicators = [
      clerkUser.publicMetadata?.hasSubscription,
      clerkUser.publicMetadata?.subscriptionActive,
      clerkUser.publicMetadata?.billing_active,
      clerkUser.privateMetadata?.hasSubscription,
      clerkUser.privateMetadata?.subscriptionActive,
      clerkUser.privateMetadata?.billing_active,
    ];
    
    console.log('Billing indicators found:', billingIndicators.filter(Boolean));
    
    // Find the first valid plan
    for (const source of planSources) {
      if (source && typeof source === 'string') {
        const planName = source.toLowerCase();
        if (planName.includes('start') || planName === 'start') {
          planId = 'start';
          hasActiveBilling = true;
          break;
        } else if (planName.includes('pro') || planName === 'pro') {
          planId = 'pro';
          hasActiveBilling = true;
          break;
        } else if (planName !== 'free') {
          planId = planName;
          hasActiveBilling = true;
          break;
        }
      }
    }
    
    // Check for any billing indicators that suggest active subscription
    for (const indicator of billingIndicators) {
      if (indicator === true || indicator === 'true' || indicator === 'active') {
        hasActiveBilling = true;
        // If we have billing but no specific plan, default to start
        if (planId === 'free') {
          planId = 'start';
        }
        break;
      }
    }
    
    console.log('Final plan determination:', { planId, hasActiveBilling });
    
    // Also try to fetch subscription data from Clerk API
    try {
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${clerkUser.id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });
      
      if (clerkResponse.ok) {
        const apiUserData = await clerkResponse.json();
        console.log('User data from Clerk API:', {
          id: apiUserData.id,
          publicMetadata: apiUserData.public_metadata,
          privateMetadata: apiUserData.private_metadata
        });
      }
    } catch (apiError) {
      console.error('Error fetching from Clerk API:', apiError);
    }
    
    // Update subscription in database
    const updateData = {
      plan_id: planId,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    };
    
    console.log('Updating subscription with:', updateData);
    
    await updateSubscriptionByUserId(clerkUser.id, updateData);
    
    // Verify the update
    const supabase = createServiceClient();
    const { data: updatedSubscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', clerkUser.id)
      .single();
    
    if (error) {
      console.error('Error fetching updated subscription:', error);
    } else {
      console.log('Updated subscription:', updatedSubscription);
    }
    
    return Response.json({ 
      success: true, 
      message: `Manual sync completed`,
      data: {
        userId: clerkUser.id,
        planId,
        hasActiveBilling,
        detectedSources: planSources.filter(Boolean),
        billingIndicators: billingIndicators.filter(Boolean),
        updatedSubscription
      }
    });
    
  } catch (error) {
    console.error('Error in manual sync:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 