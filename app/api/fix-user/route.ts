import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServiceClient } from '@/utils/supabase/server';
import { upsertUser } from '@/lib/auth/user-management';

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Fixing user and subscription for:', clerkUser.id);
    
    const supabase = createServiceClient();
    
    // Step 1: Create/update user in database
    const userData = {
      id: clerkUser.id,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      display_name: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
        : clerkUser.firstName || clerkUser.lastName || null,
    };
    
    const dbUser = await upsertUser(userData);
    console.log('User created/updated:', dbUser.id);
    
    // Step 2: Get subscription plan from Clerk
    let planId = 'free';
    const metadata = clerkUser.publicMetadata || {};
    
    if (metadata.planId) {
      planId = metadata.planId as string;
    } else if (metadata.subscriptionPlan) {
      planId = metadata.subscriptionPlan as string;
    }
    
    // Check organization subscriptions (for Clerk billing)
    if (clerkUser.organizationMemberships && clerkUser.organizationMemberships.length > 0) {
      const org = clerkUser.organizationMemberships[0].organization;
      const orgMetadata = org.publicMetadata || {};
      
      if (orgMetadata.planId) {
        planId = orgMetadata.planId as string;
      }
    }
    
    console.log('Detected plan:', planId);
    
    // Step 3: Create/update subscription
    const subscription = {
      user_id: clerkUser.id,
      plan_id: planId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    };
    
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .upsert(subscription, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (subError) {
      console.error('Error creating subscription:', subError);
      throw new Error(`Failed to create subscription: ${subError.message}`);
    }
    
    console.log('Subscription created/updated:', subData.id, 'Plan:', subData.plan_id);
    
    return Response.json({
      success: true,
      message: 'User and subscription fixed successfully',
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.display_name
        },
        subscription: {
          id: subData.id,
          planId: subData.plan_id,
          status: subData.status
        }
      }
    });
    
  } catch (error) {
    console.error('Error fixing user:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 