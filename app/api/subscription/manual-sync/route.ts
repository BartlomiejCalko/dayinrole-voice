import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServiceClient } from '@/utils/supabase/server';
import { upsertUser } from '@/lib/auth/user-management';

export async function POST(req: NextRequest) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Manual sync requested for user:', clerkUser.id);
    
    const supabase = createServiceClient();
    
    // Step 1: Ensure user exists in database
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
    console.log('User ensured in database:', dbUser.id);
    
    // Step 2: Get subscription info from Clerk metadata
    let planId = 'free';
    let subscriptionStatus = 'active';
    
    // Try to get plan from Clerk metadata (this is where Clerk billing stores it)
    const metadata = clerkUser.publicMetadata || {};
    
    if (metadata.planId) {
      planId = metadata.planId as string;
    } else if (metadata.subscriptionPlan) {
      planId = metadata.subscriptionPlan as string;
    }
    
    // Check for organization-based subscriptions
    if (clerkUser.organizationMemberships && clerkUser.organizationMemberships.length > 0) {
      const org = clerkUser.organizationMemberships[0].organization;
      const orgMetadata = org.publicMetadata || {};
      
      if (orgMetadata.planId) {
        planId = orgMetadata.planId as string;
      }
    }
    
    console.log('Detected subscription plan:', planId);
    
    // Step 3: Update or create subscription in database
    const subscriptionRecord = {
      user_id: clerkUser.id,
      plan_id: planId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      status: subscriptionStatus as 'active' | 'canceled',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancel_at_period_end: false,
    };
    
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionRecord, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (subError) {
      console.error('Error upserting subscription:', subError);
      throw new Error(`Failed to upsert subscription: ${subError.message}`);
    }
    
    console.log('Subscription synced successfully:', subscription.id);
    
    // Step 4: Create or update usage tracking
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1); // First day of current month
    
    const usageRecord = {
      user_id: clerkUser.id,
      subscription_id: subscription.id,
      period_start: currentPeriodStart.toISOString(),
      period_end: new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth() + 1, 0).toISOString(),
      dayinrole_used: 0,
      interviews_used: 0,
      reset_at: new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth() + 1, 1).toISOString(),
    };
    
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .upsert(usageRecord, {
        onConflict: 'user_id,period_start',
        ignoreDuplicates: false
      });
    
    if (usageError) {
      console.error('Error creating usage tracking:', usageError);
      // Don't fail the whole process
    } else {
      console.log('Usage tracking created/updated');
    }
    
    return Response.json({
      success: true,
      message: 'User and subscription synced successfully',
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          displayName: dbUser.display_name
        },
        subscription: {
          id: subscription.id,
          planId: subscription.plan_id,
          status: subscription.status,
          createdAt: subscription.created_at,
          updatedAt: subscription.updated_at
        },
        clerkMetadata: {
          publicMetadata: clerkUser.publicMetadata,
          privateMetadata: clerkUser.privateMetadata,
          organizationMemberships: clerkUser.organizationMemberships?.map(m => ({
            id: m.id,
            role: m.role,
            organization: {
              id: m.organization.id,
              name: m.organization.name,
              publicMetadata: m.organization.publicMetadata
            }
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error in manual sync:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during sync' 
      },
      { status: 500 }
    );
  }
} 