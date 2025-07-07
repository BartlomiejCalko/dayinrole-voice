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
    console.error('Missing svix headers');
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
  const eventData = evt.data;
  
  console.log('Clerk webhook event:', eventType, 'for user:', eventData?.id);
  console.log('Full webhook payload:', JSON.stringify(evt, null, 2));

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = eventData;
      
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
      
    } else if (eventType === 'user.deleted') {
      const { id } = eventData;
      
      console.log('Deleting user from database via webhook:', id);
      await deleteUser(id);
      console.log('User deleted successfully via webhook:', id);
      
    } else if (eventType === 'subscription.created' || eventType === 'subscription.updated' || eventType === 'subscription.active') {
      console.log('Processing subscription event:', eventType);
      console.log('Event data keys:', Object.keys(eventData));
      
      // Extract user_id - it might be in different places depending on the event
      let user_id = eventData.user_id || eventData.id;
      
      // For subscription events, the user_id might be nested or in metadata
      if (!user_id && eventData.metadata) {
        user_id = eventData.metadata.user_id;
      }
      
      // If still no user_id, check if this is a user object with subscription data
      if (!user_id && eventData.public_metadata) {
        user_id = eventData.id; // This might be a user object with subscription metadata
      }
      
      if (!user_id) {
        console.error('No user_id found in subscription event:', eventData);
        return new Response('No user_id found', { status: 400 });
      }
      
      console.log('Processing subscription for user:', user_id);
      
      const supabase = createServiceClient();
      
      // First, ensure user exists in database
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
      
      // Get current user subscription from Clerk API
      console.log('Fetching current user subscription from Clerk API for user:', user_id);
      let planId = 'free'; // Default to free
      let subscriptionStatus = 'active';
      
      try {
        const clerkUserResponse = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        });
        
        if (clerkUserResponse.ok) {
          const clerkUser = await clerkUserResponse.json();
          console.log('Clerk user data for subscription check:', {
            id: clerkUser.id,
            public_metadata: clerkUser.public_metadata,
            private_metadata: clerkUser.private_metadata,
            subscription_data: clerkUser.subscription_data
          });
          
          // Check various places where plan information might be stored in Clerk user data
          const planSources = [
            clerkUser.public_metadata?.planId,
            clerkUser.public_metadata?.plan_id,
            clerkUser.public_metadata?.subscriptionPlan,
            clerkUser.public_metadata?.subscription_plan,
            clerkUser.private_metadata?.planId,
            clerkUser.private_metadata?.plan_id,
            clerkUser.private_metadata?.subscriptionPlan,
            clerkUser.private_metadata?.subscription_plan,
          ];
          
          // Find the first non-null plan source
          for (const source of planSources) {
            if (source && typeof source === 'string') {
              const planName = source.toLowerCase();
              if (planName.includes('start') || planName === 'start') {
                planId = 'start';
                break;
              } else if (planName.includes('pro') || planName === 'pro') {
                planId = 'pro';
                break;
              } else if (planName !== 'free') {
                // If it's not 'free' and doesn't match start/pro, assume it's a valid plan ID
                planId = planName;
                break;
              }
            }
          }
          
          // Also check for subscription status
          const statusSources = [
            clerkUser.public_metadata?.subscriptionStatus,
            clerkUser.public_metadata?.subscription_status,
            clerkUser.private_metadata?.subscriptionStatus,
            clerkUser.private_metadata?.subscription_status,
          ];
          
          for (const source of statusSources) {
            if (source && typeof source === 'string') {
              const status = source.toLowerCase();
              if (['active', 'canceled', 'cancelled', 'past_due'].includes(status)) {
                subscriptionStatus = status === 'cancelled' ? 'canceled' : status;
                break;
              }
            }
          }
          
          console.log('Plan detected from Clerk API:', planId, 'Status:', subscriptionStatus);
        } else {
          console.error('Failed to fetch user from Clerk API:', clerkUserResponse.status, clerkUserResponse.statusText);
          
          // Fallback: try to determine plan from webhook payload as backup
          const planSources = [
            eventData.plan_id,
            eventData.subscription_plan_id,
            eventData.public_metadata?.planId,
            eventData.public_metadata?.plan_id,
            eventData.public_metadata?.subscriptionPlan,
          ];
          
          for (const source of planSources) {
            if (source && typeof source === 'string') {
              const planName = source.toLowerCase();
              if (planName.includes('start') || planName === 'start') {
                planId = 'start';
                break;
              } else if (planName.includes('pro') || planName === 'pro') {
                planId = 'pro';
                break;
              }
            }
          }
          
          console.log('Fallback plan from webhook payload:', planId);
        }
      } catch (clerkError) {
        console.error('Error fetching user subscription from Clerk:', clerkError);
        
        // For subscription.active events, assume it's not free (since free plans don't typically have active subscriptions)
        if (eventType === 'subscription.active') {
          planId = 'start'; // Default to 'start' for active subscription events
          console.log('Using fallback plan for subscription.active event:', planId);
        }
      }
      
      console.log('Final determined plan ID:', planId, 'from event type:', eventType);
      
      // Use the subscription status we got from Clerk API, with fallback to webhook data
      let status: 'active' | 'canceled' | 'past_due' = subscriptionStatus as 'active' | 'canceled' | 'past_due';
      
      // Fallback to webhook event data if we didn't get status from Clerk API
      if (status === 'active' && eventData.status) {
        const eventStatus = eventData.status.toLowerCase();
        if (eventStatus === 'canceled' || eventStatus === 'cancelled') {
          status = 'canceled';
        } else if (eventStatus === 'past_due') {
          status = 'past_due';
        }
      }
      
      // Update subscription in database
      const subscriptionData = {
        user_id: user_id,
        plan_id: planId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: status,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancel_at_period_end: eventData.cancel_at_period_end || false,
      };
      
      console.log('Upserting subscription data:', subscriptionData);
      
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
      
      console.log('Subscription updated successfully:', { user_id, planId, status });
      
    } else {
      console.log('Unhandled webhook event type:', eventType);
    }
    
    return new Response('Webhook processed successfully', { status: 200 });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 