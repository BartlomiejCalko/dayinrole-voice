import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createServiceClient } from '@/utils/supabase/server';
import { upsertUser, deleteUser } from '@/lib/auth/user-management';
import { updateSubscriptionByUserId } from '@/lib/subscription/queries';

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('Clerk webhook event:', eventType, 'for user:', evt.data?.id);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    try {
      const supabase = createServiceClient();
      
      // Create user in database using upsert to handle race conditions
      const userData = {
        id: id,
        first_name: first_name || null,
        last_name: last_name || null,
        email: email_addresses?.[0]?.email_address || '',
        display_name: first_name && last_name 
          ? `${first_name} ${last_name}`.trim()
          : first_name || last_name || null,
      };
      
      console.log('Creating user in database via webhook:', { id, email: userData.email });
      
      const user = await upsertUser(userData);
      console.log('User upserted successfully via webhook:', user.id);
      
      // Create default free subscription for new user using upsert
      const freeSubscription = {
        user_id: id,
        plan_id: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        cancel_at_period_end: false,
      };
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(freeSubscription, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
      if (subError) {
        console.error('Error creating free subscription:', subError);
        // Don't fail the webhook if subscription creation fails
      } else {
        console.log('Free subscription upserted for user:', id);
      }
      
    } catch (error) {
      console.error('Error processing user creation webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  } else if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    try {
      const supabase = createServiceClient();
      
      // Update user in database
      const updatedUser = {
        first_name: first_name || null,
        last_name: last_name || null,
        email: email_addresses?.[0]?.email_address || '',
        display_name: first_name && last_name 
          ? `${first_name} ${last_name}`.trim()
          : first_name || last_name || null,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Updating user in database:', { id, email: updatedUser.email });
      
      const { data, error } = await supabase
        .from('users')
        .update(updatedUser)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user in database:', error);
        return new Response('Error updating user', { status: 500 });
      }
      
      console.log('User updated successfully via webhook:', data.id);
      
    } catch (error) {
      console.error('Error processing user update webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  } else if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      console.log('Deleting user from database via webhook:', id);
      
      await deleteUser(id);
      console.log('User deleted successfully via webhook:', id);
      
    } catch (error) {
      console.error('Error processing user deletion webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  } else if (eventType === 'subscription.created') {
    // Handle Clerk subscription created
    const { subscription, user_id } = evt.data;
    
    try {
      console.log('Processing Clerk subscription created:', { subscription, user_id });
      
      const supabase = createServiceClient();
      
      // Map Clerk subscription to your app's plan
      let planId = 'free';
      if (subscription.subscription_plan_id) {
        // Map Clerk plan IDs to your app's plan IDs
        if (subscription.subscription_plan_id.includes('pro')) {
          planId = 'pro';
        } else if (subscription.subscription_plan_id.includes('start')) {
          planId = 'start';
        }
      }
      
      // Update user's subscription in database
      const updateData = {
        plan_id: planId,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancel_at_period_end: false,
      };
      
      await updateSubscriptionByUserId(user_id, updateData);
      console.log('Clerk subscription created, database updated:', { user_id, planId });
      
    } catch (error) {
      console.error('Error processing Clerk subscription created:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  } else if (eventType === 'subscription.updated') {
    // Handle Clerk subscription updated
    const { subscription, user_id } = evt.data;
    
    try {
      console.log('Processing Clerk subscription updated:', { subscription, user_id });
      
      const supabase = createServiceClient();
      
      // Map Clerk subscription to your app's plan
      let planId = 'free';
      if (subscription.subscription_plan_id) {
        if (subscription.subscription_plan_id.includes('pro')) {
          planId = 'pro';
        } else if (subscription.subscription_plan_id.includes('start')) {
          planId = 'start';
        }
      }
      
      // Update user's subscription in database
      const updateData = {
        plan_id: planId,
        status: subscription.status === 'active' ? 'active' as const : 'canceled' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      };
      
      await updateSubscriptionByUserId(user_id, updateData);
      console.log('Clerk subscription updated, database updated:', { user_id, planId });
      
    } catch (error) {
      console.error('Error processing Clerk subscription updated:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  } else if (eventType === 'subscription.deleted') {
    // Handle Clerk subscription deleted
    const { user_id } = evt.data;
    
    try {
      console.log('Processing Clerk subscription deleted:', { user_id });
      
      const supabase = createServiceClient();
      
      // Update user's subscription back to free
      const updateData = {
        plan_id: 'free',
        status: 'canceled' as const,
        cancel_at_period_end: true,
      };
      
      await updateSubscriptionByUserId(user_id, updateData);
      console.log('Clerk subscription deleted, database updated to free:', { user_id });
      
    } catch (error) {
      console.error('Error processing Clerk subscription deleted:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
} 