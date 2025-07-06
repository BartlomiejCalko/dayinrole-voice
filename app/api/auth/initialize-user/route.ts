import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { initializeUser } from '@/lib/auth/user-management';

export async function POST(req: NextRequest) {
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
    
    // Initialize user in database with subscription
    const { user, subscription } = await initializeUser(clerkUser);
    
    return Response.json({
      success: true,
      message: 'User initialized successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          displayName: user.display_name
        },
        subscription: subscription ? {
          id: subscription.id,
          planId: subscription.plan_id,
          status: subscription.status
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error initializing user:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 