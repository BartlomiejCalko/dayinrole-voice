import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserSubscriptionStatus } from '@/lib/subscription';
import { createServiceClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    console.log('Debug subscription data for user:', clerkUser.id);
    
    // Get subscription status from our logic
    const subscriptionStatus = await getUserSubscriptionStatus(clerkUser.id);
    
    // Get raw subscription data from database
    const supabase = createServiceClient();
    const { data: dbSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', clerkUser.id)
      .single();
    
    // Get usage data
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', clerkUser.id)
      .gte('period_end', new Date().toISOString())
      .single();
    
    const debugData = {
      success: true,
      user: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        lastActiveAt: clerkUser.lastActiveAt,
        createdAt: clerkUser.createdAt,
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata,
        organizationMemberships: clerkUser.organizationMemberships?.map(m => ({
          id: m.id,
          role: m.role,
          orgId: m.organization.id,
          orgName: m.organization.name,
          orgMetadata: m.organization.publicMetadata
        }))
      },
      subscription: {
        computed: subscriptionStatus,
        database: dbSubscription,
        usage: usage
      },
      metadata: {
        planId: clerkUser.publicMetadata?.planId || clerkUser.privateMetadata?.planId,
        subscriptionPlan: clerkUser.publicMetadata?.subscriptionPlan || clerkUser.privateMetadata?.subscriptionPlan,
        hasBilling: clerkUser.publicMetadata?.hasBilling || clerkUser.privateMetadata?.hasBilling,
        subscription: clerkUser.publicMetadata?.subscription || clerkUser.privateMetadata?.subscription
      },
      recommendations: []
    };
    
    // Add recommendations based on the data
    if (!dbSubscription) {
      debugData.recommendations.push('No subscription found in database. Run sync to create one.');
    } else if (dbSubscription.plan_id === 'free' && subscriptionStatus.isFreePlan) {
      debugData.recommendations.push('User appears to be on free plan. If they upgraded, run manual sync.');
    } else if (dbSubscription.plan_id !== 'free' && subscriptionStatus.isFreePlan) {
      debugData.recommendations.push('Database shows paid plan but computed as free. Check subscription logic.');
    }
    
    if (!clerkUser.publicMetadata?.planId && !clerkUser.privateMetadata?.planId) {
      debugData.recommendations.push('No plan ID found in Clerk metadata. This may cause sync issues.');
    }
    
    return Response.json(debugData, { status: 200 });
    
  } catch (error) {
    console.error('Error in subscription debug:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 