import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { updateSubscriptionByUserId } from '@/lib/subscription/queries';

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    console.log('Auto-syncing subscription from Clerk for user:', clerkUser.id);
    console.log('Clerk user metadata:', {
      publicMetadata: clerkUser.publicMetadata,
      privateMetadata: clerkUser.privateMetadata
    });
    
    // Default to free - only upgrade if there's explicit billing evidence
    let planId = 'free';
    
    // Check if user has any billing subscriptions at all (MUCH more conservative now)
    const hasActiveBilling = await checkClerkBillingStatus(clerkUser);
    
    if (hasActiveBilling) {
      console.log('User has active billing in Clerk');
      // If user has active billing, determine the plan
      planId = await determineClerkPlan(clerkUser);
    } else {
      console.log('No active billing found in Clerk - keeping free plan');
      planId = 'free'; // Explicitly set to free
    }
    
    // Validate plan ID
    const validPlans = ['free', 'start', 'pro'];
    if (!validPlans.includes(planId)) {
      console.log('Invalid plan ID detected:', planId, 'defaulting to free');
      planId = 'free';
    }
    
    console.log('Final detected plan for user:', { userId: clerkUser.id, planId });
    
    // Update subscription in database
    const updateData = {
      plan_id: planId,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancel_at_period_end: false,
    };
    
    await updateSubscriptionByUserId(clerkUser.id, updateData);
    
    console.log('Subscription auto-synced successfully:', { userId: clerkUser.id, planId });
    
    return Response.json({ 
      success: true, 
      message: `Subscription synced to ${planId} plan`,
      planId: planId
    });
    
  } catch (error) {
    console.error('Error syncing subscription from Clerk:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function checkClerkBillingStatus(clerkUser: any): Promise<boolean> {
  // CONSERVATIVE: Only return true if there's explicit billing evidence
  
  // 1. Check metadata for explicit billing indicators
  if (clerkUser.publicMetadata?.hasBilling === true || 
      clerkUser.privateMetadata?.hasBilling === true) {
    console.log('Found explicit billing metadata');
    return true;
  }
  
  // 2. Check for subscription data in metadata
  const publicSub = clerkUser.publicMetadata?.subscription;
  const privateSub = clerkUser.privateMetadata?.subscription;
  
  if (publicSub && typeof publicSub === 'object' && publicSub.plan_id && publicSub.plan_id !== 'free') {
    console.log('Found paid subscription in public metadata:', publicSub.plan_id);
    return true;
  }
  
  if (privateSub && typeof privateSub === 'object' && privateSub.plan_id && privateSub.plan_id !== 'free') {
    console.log('Found paid subscription in private metadata:', privateSub.plan_id);
    return true;
  }
  
  // 3. Check for explicit paid plan indicators
  const publicPlan = clerkUser.publicMetadata?.planId || clerkUser.publicMetadata?.subscriptionPlan;
  const privatePlan = clerkUser.privateMetadata?.planId || clerkUser.privateMetadata?.subscriptionPlan;
  
  if (publicPlan && publicPlan !== 'free') {
    console.log('Found paid plan in public metadata:', publicPlan);
    return true;
  }
  
  if (privatePlan && privatePlan !== 'free') {
    console.log('Found paid plan in private metadata:', privatePlan);
    return true;
  }
  
  // 4. Check organization memberships for billing
  if (clerkUser.organizationMemberships?.length > 0) {
    for (const membership of clerkUser.organizationMemberships) {
      const orgPlan = membership.organization.publicMetadata?.planId;
      if (orgPlan && orgPlan !== 'free') {
        console.log('Found paid plan in organization metadata:', orgPlan);
        return true;
      }
    }
  }
  
  // 5. REMOVED THE BAD HEURISTIC - No more assumptions!
  console.log('No explicit billing evidence found - user should remain on free plan');
  return false;
}

async function determineClerkPlan(clerkUser: any): Promise<string> {
  // Try to determine the exact plan from various sources
  
  // 1. Direct plan ID in metadata
  if (clerkUser.publicMetadata?.planId) {
    const planId = clerkUser.publicMetadata.planId as string;
    console.log('Found plan in publicMetadata:', planId);
    return planId;
  }
  
  if (clerkUser.privateMetadata?.planId) {
    const planId = clerkUser.privateMetadata.planId as string;
    console.log('Found plan in privateMetadata:', planId);
    return planId;
  }
  
  // 2. Alternative plan field names
  if (clerkUser.publicMetadata?.subscriptionPlan) {
    const planId = clerkUser.publicMetadata.subscriptionPlan as string;
    console.log('Found plan in subscriptionPlan metadata:', planId);
    return planId;
  }
  
  if (clerkUser.privateMetadata?.subscriptionPlan) {
    const planId = clerkUser.privateMetadata.subscriptionPlan as string;
    console.log('Found plan in subscriptionPlan metadata:', planId);
    return planId;
  }
  
  // 3. Check subscription object in metadata
  const subscriptionData = clerkUser.publicMetadata?.subscription || 
                          clerkUser.privateMetadata?.subscription;
  
  if (subscriptionData && typeof subscriptionData === 'object') {
    const subData = subscriptionData as any;
    if (subData.plan_id) {
      console.log('Found plan_id in subscription metadata:', subData.plan_id);
      return subData.plan_id;
    }
    if (subData.planId) {
      console.log('Found planId in subscription metadata:', subData.planId);
      return subData.planId;
    }
    if (subData.plan) {
      console.log('Found plan in subscription metadata:', subData.plan);
      return subData.plan;
    }
  }
  
  // 4. Check organization memberships
  if (clerkUser.organizationMemberships?.length > 0) {
    for (const membership of clerkUser.organizationMemberships) {
      if (membership.organization.publicMetadata?.planId) {
        const planId = membership.organization.publicMetadata.planId as string;
        console.log('Found plan in organization metadata:', planId);
        return planId;
      }
    }
  }
  
  // 5. FIXED: Default to free instead of start when we can't determine
  console.log('Could not determine exact plan - defaulting to free plan for safety');
  return 'free';
} 