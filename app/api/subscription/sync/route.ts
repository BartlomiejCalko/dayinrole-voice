import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getSubscriptionByUserId, updateSubscriptionByUserId } from '@/lib/subscription/queries';
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

    // For Clerk subscriptions, we sync from Clerk's system
    console.log('Syncing subscription with Clerk for user:', user.uid);
    
    try {
      // Get subscription status from Clerk through our getUserSubscriptionStatus function
      // This function should handle fetching the latest subscription data from Clerk
      const clerkSubscriptionStatus = await getUserSubscriptionStatus(user.uid);
      
      if (clerkSubscriptionStatus) {
        // Update subscription with Clerk data
        const updateData = {
          plan_id: clerkSubscriptionStatus.plan_id,
          status: clerkSubscriptionStatus.status,
          current_period_start: clerkSubscriptionStatus.current_period_start,
          current_period_end: clerkSubscriptionStatus.current_period_end,
          cancel_at_period_end: clerkSubscriptionStatus.cancel_at_period_end,
        };

        await updateSubscriptionByUserId(user.uid, updateData);
        console.log('Subscription synced successfully with Clerk data');
        
        return Response.json({ 
          success: true, 
          message: 'Subscription synced with Clerk successfully',
          subscription: {
            ...currentSubscription,
            ...updateData
          }
        });
      } else {
        return Response.json({ 
          success: false, 
          error: 'Unable to fetch subscription status from Clerk' 
        }, { status: 400 });
      }
      
    } catch (clerkError: any) {
      console.error('Error syncing with Clerk:', clerkError);
      return Response.json({ 
        success: false, 
        error: `Failed to sync with Clerk: ${clerkError.message}` 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 