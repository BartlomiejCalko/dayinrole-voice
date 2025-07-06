import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/auth/user-management';
import { getSubscriptionByUserId } from '@/lib/subscription/queries';

export async function GET(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    // Check if user exists in database
    const databaseUser = await getUserById(clerkUser.id);
    
    // Check if user has a subscription
    const subscription = await getSubscriptionByUserId(clerkUser.id);
    
    return Response.json({
      success: true,
      data: {
        clerkUser: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          createdAt: clerkUser.createdAt
        },
        databaseUser: databaseUser ? {
          id: databaseUser.id,
          email: databaseUser.email,
          firstName: databaseUser.first_name,
          lastName: databaseUser.last_name,
          displayName: databaseUser.display_name,
          createdAt: databaseUser.created_at
        } : null,
        subscription: subscription ? {
          id: subscription.id,
          planId: subscription.plan_id,
          status: subscription.status,
          createdAt: subscription.created_at
        } : null,
        status: {
          existsInDatabase: !!databaseUser,
          hasSubscription: !!subscription
        }
      }
    });
    
  } catch (error) {
    console.error('Error checking user status:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 