import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { userService } from '@/lib/services/user.service';
import { subscriptionService } from '@/lib/services/subscription.service';

export async function GET(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Check if user exists in database
    const dbUser = await userService.getUserById(clerkUser.id);
    const subscription = await subscriptionService.getSubscriptionByUserId(clerkUser.id);

    return Response.json({
      success: true,
      data: {
        clerk: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
        database: {
          userExists: !!dbUser,
          user: dbUser ? {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.display_name,
          } : null,
          subscription: subscription ? {
            id: subscription.id,
            planId: subscription.plan_id,
            status: subscription.status,
          } : null,
        },
        status: {
          synced: !!dbUser && !!subscription,
          userInDatabase: !!dbUser,
          hasSubscription: !!subscription,
        }
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 