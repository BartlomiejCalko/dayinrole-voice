import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { ensureUserExists } from '@/lib/auth/user-management';
import { getSubscriptionByUserId } from '@/lib/subscription/queries';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth();
    
    // Ensure user exists in database
    const dbUser = await ensureUserExists(authUser);
    console.log('User ensured in database:', dbUser.id);
    
    // Check if user already has a subscription
    const existingSubscription = await getSubscriptionByUserId(authUser.uid);
    
    if (!existingSubscription) {
      // Create free subscription for existing user
      const supabase = createServiceClient();
      const freeSubscription = {
        user_id: authUser.uid,
        plan_id: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        cancel_at_period_end: false,
      };
      
      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .upsert(freeSubscription, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (subError) {
        console.error('Error creating free subscription:', subError);
        throw new Error('Failed to create free subscription');
      }
      
      console.log('Free subscription created for existing user:', newSub.id);
      
      return Response.json({
        success: true,
        message: 'User initialized successfully with free subscription',
        data: {
          user: dbUser,
          subscription: newSub
        }
      });
    } else {
      return Response.json({
        success: true,
        message: 'User already has subscription',
        data: {
          user: dbUser,
          subscription: existingSubscription
        }
      });
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize user' 
      },
      { status: 500 }
    );
  }
} 