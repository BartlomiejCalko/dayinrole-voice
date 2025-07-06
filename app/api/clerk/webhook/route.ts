import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createServiceClient } from '@/utils/supabase/server';
import { upsertUser, deleteUser } from '@/lib/auth/user-management';

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
      console.log('Creating user in database via webhook:', { id, email: email_addresses?.[0]?.email_address });
      
      // Create user in database
      const userData = {
        id: id,
        first_name: first_name || null,
        last_name: last_name || null,
        email: email_addresses?.[0]?.email_address || '',
        display_name: first_name && last_name 
          ? `${first_name} ${last_name}`.trim()
          : first_name || last_name || null,
      };
      
      const user = await upsertUser(userData);
      console.log('User created successfully via webhook:', user.id);
      
      // Create default free subscription
      const supabase = createServiceClient();
      const freeSubscription = {
        user_id: id,
        plan_id: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
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
      } else {
        console.log('Free subscription created for user:', id);
      }
      
    } catch (error) {
      console.error('Error processing user creation webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  } 
  
  else if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    try {
      console.log('Updating user in database:', { id, email: email_addresses?.[0]?.email_address });
      
      const supabase = createServiceClient();
      const updatedUser = {
        first_name: first_name || null,
        last_name: last_name || null,
        email: email_addresses?.[0]?.email_address || '',
        display_name: first_name && last_name 
          ? `${first_name} ${last_name}`.trim()
          : first_name || last_name || null,
        updated_at: new Date().toISOString(),
      };
      
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
  } 
  
  else if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      console.log('Deleting user from database via webhook:', id);
      await deleteUser(id);
      console.log('User deleted successfully via webhook:', id);
    } catch (error) {
      console.error('Error processing user deletion webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  else if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
    const { subscription, user_id } = evt.data;
    
    try {
      console.log('Processing subscription event:', eventType, 'for user:', user_id);
      
      const supabase = createServiceClient();
      
      // First, ensure user exists in database (in case webhook order is wrong)
      const { data: existingUser, error: userFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();
      
      if (userFetchError || !existingUser) {
        console.log('User not found, fetching from Clerk to create:', user_id);
        
        try {
          const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
          });
          
          if (clerkResponse.ok) {
            const clerkUser = await clerkResponse.json();
            const userData = {
              id: clerkUser.id,
              first_name: clerkUser.first_name || null,
              last_name: clerkUser.last_name || null,
              email: clerkUser.email_addresses?.[0]?.email_address || '',
              display_name: clerkUser.first_name && clerkUser.last_name 
                ? `${clerkUser.first_name} ${clerkUser.last_name}`.trim()
                : clerkUser.first_name || clerkUser.last_name || null,
            };
            
            await upsertUser(userData);
            console.log('User created for subscription event:', user_id);
          }
        } catch (clerkError) {
          console.error('Error creating user from Clerk:', clerkError);
        }
      }
      
      // Map subscription plan
      let planId = 'free';
      if (subscription.subscription_plan_id) {
        const planName = subscription.subscription_plan_id.toLowerCase();
        if (planName.includes('pro')) {
          planId = 'pro';
        } else if (planName.includes('start')) {
          planId = 'start';
        }
      }
      
      console.log('Updating subscription to plan:', planId);
      
      // Update subscription in database
      const subscriptionData = {
        user_id: user_id,
        plan_id: planId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: subscription.status === 'active' ? 'active' as const : 'canceled' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      };
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
      if (subError) {
        console.error('Error updating subscription:', subError);
        return new Response('Error updating subscription', { status: 500 });
      }
      
      console.log('Subscription updated successfully:', { user_id, planId });
      
    } catch (error) {
      console.error('Error processing subscription webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
} 