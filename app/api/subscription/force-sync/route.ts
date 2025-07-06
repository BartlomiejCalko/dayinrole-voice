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

    const { planId } = await req.json();
    
    if (!planId) {
      return Response.json({ 
        success: false, 
        error: 'Plan ID is required' 
      }, { status: 400 });
    }

    // Validate plan ID
    const validPlans = ['free', 'start', 'pro'];
    if (!validPlans.includes(planId)) {
      return Response.json({ 
        success: false, 
        error: 'Invalid plan ID. Valid plans: free, start, pro' 
      }, { status: 400 });
    }

    console.log('Force syncing subscription for user:', clerkUser.id, 'to plan:', planId);
    
    // Update subscription in database
    const updateData = {
      plan_id: planId,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancel_at_period_end: false,
    };
    
    await updateSubscriptionByUserId(clerkUser.id, updateData);
    
    console.log('Subscription force synced successfully:', { userId: clerkUser.id, planId });
    
    return Response.json({ 
      success: true, 
      message: `Subscription force synced to ${planId} plan`,
      planId: planId
    });
    
  } catch (error) {
    console.error('Error force syncing subscription:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 