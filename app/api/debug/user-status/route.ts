import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getUserById } from '@/lib/auth/user-management';
import { getSubscriptionByUserId, getUsageTracking } from '@/lib/subscription/queries';

export async function GET(req: NextRequest) {
  try {
    const authUser = await verifyAuth();
    
    // Check if user exists in database
    const dbUser = await getUserById(authUser.uid);
    
    // Check subscription
    const subscription = await getSubscriptionByUserId(authUser.uid);
    
    // Check usage tracking
    const usage = await getUsageTracking(authUser.uid);
    
    return Response.json({
      success: true,
      data: {
        authUser: {
          uid: authUser.uid,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
        },
        databaseUser: dbUser,
        subscription: subscription,
        usage: usage,
        status: {
          userExistsInDb: !!dbUser,
          hasSubscription: !!subscription,
          hasUsageTracking: !!usage,
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