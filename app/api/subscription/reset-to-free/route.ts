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

    console.log('Resetting subscription to free for user:', clerkUser.id);
    
    // Reset to free plan
    const updateData = {
      plan_id: 'free',
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      cancel_at_period_end: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    };
    
    await updateSubscriptionByUserId(clerkUser.id, updateData);
    
    console.log('Subscription reset to free successfully:', { userId: clerkUser.id });
    
    return Response.json({ 
      success: true, 
      message: 'Subscription reset to free plan successfully',
      planId: 'free'
    });
    
  } catch (error) {
    console.error('Error resetting subscription to free:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 