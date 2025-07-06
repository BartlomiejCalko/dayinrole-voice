import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { upsertUser } from '@/lib/auth/user-management';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    
    console.log('Testing user creation with potential race condition...');
    
    // Test upsert functionality
    const userData = {
      id: user.uid,
      first_name: user.firstName || 'Test',
      last_name: user.lastName || 'User',
      email: user.email || 'test@example.com',
      display_name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : 'Test User',
    };
    
    // Try to create the user multiple times rapidly (simulating race condition)
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(upsertUser(userData));
    }
    
    const results = await Promise.all(promises);
    
    console.log('All upsert operations completed successfully');
    
    // Verify subscription creation
    const supabase = createServiceClient();
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.uid)
      .single();
    
    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
    }
    
    return Response.json({
      success: true,
      message: 'User creation test completed successfully',
      data: {
        userId: user.uid,
        upsertResults: results.map(r => ({
          id: r.id,
          email: r.email,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        })),
        hasSubscription: !!subscription,
        subscription: subscription ? {
          id: subscription.id,
          planId: subscription.plan_id,
          status: subscription.status
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error in user creation test:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 