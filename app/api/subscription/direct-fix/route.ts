import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return Response.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    console.log('🔧 DIRECT FIX - Starting for user:', clerkUser.id);
    
    const supabase = createServiceClient();
    
    // First, check if subscription exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', clerkUser.id)
      .single();

    console.log('Existing subscription:', existingSubscription);
    console.log('Check error:', checkError);

    const subscriptionData = {
      plan_id: 'start',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString()
    };

    let result;
    if (checkError && checkError.code === 'PGRST116') {
      // No subscription exists, create one
      console.log('Creating new subscription...');
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: clerkUser.id,
          ...subscriptionData
        })
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Update existing subscription
      console.log('Updating existing subscription...');
      const { data, error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('user_id', clerkUser.id)
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('Database operation error:', result.error);
      return Response.json({ 
        success: false, 
        error: `Database error: ${result.error.message}`,
        details: result.error
      }, { status: 500 });
    }

    console.log('🎉 DIRECT FIX - Success! Updated subscription:', result.data);
    
    // Verify the update worked
    const { data: verifyData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', clerkUser.id)
      .single();
    
    console.log('Verification - Updated subscription:', verifyData);
    
    return Response.json({ 
      success: true, 
      message: 'Subscription directly fixed to Start Plan',
      data: result.data,
      verification: verifyData
    });
    
  } catch (error) {
    console.error('🚨 DIRECT FIX - Error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 