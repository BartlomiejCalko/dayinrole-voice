#!/usr/bin/env node

/**
 * Script to reset a user's subscription to free plan
 * Usage: node scripts/reset-subscription-to-free.js <user_id>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetSubscriptionToFree(userId) {
  try {
    console.log(`Resetting subscription to free for user: ${userId}`);
    
    // Check current subscription
    const { data: currentSub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (currentSub) {
      console.log(`Current subscription: ${currentSub.plan_id} (${currentSub.status})`);
    } else {
      console.log('No existing subscription found');
    }
    
    // Reset to free plan
    const updateData = {
      user_id: userId,
      plan_id: 'free',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      cancel_at_period_end: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    };
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(updateData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Subscription reset to free successfully!');
    console.log(`New subscription: ${data.plan_id} (${data.status})`);
    
  } catch (error) {
    console.error('❌ Error resetting subscription:', error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/reset-subscription-to-free.js <user_id>');
  console.error('Example: node scripts/reset-subscription-to-free.js user_2VgT6hkVOyYDjYwE5Q3CnPQqZwj');
  process.exit(1);
}

resetSubscriptionToFree(userId); 