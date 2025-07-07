import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createServiceClient } from '@/utils/supabase/server';
import { upsertUser, deleteUser } from '@/lib/auth/user-management';

// Helper function to fetch user from Clerk with timeout
async function fetchClerkUser(userId: string, timeout = 5000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Clerk API error:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching user from Clerk:', error);
    return null;
  }
}

// Helper function to extract plan from user data
function extractPlanFromUser(userData: any): string {
  if (!userData) return 'free';
  
  const planSources = [
    userData.public_metadata?.planId,
    userData.public_metadata?.plan_id,
    userData.public_metadata?.subscriptionPlan,
    userData.public_metadata?.subscription_plan,
    userData.private_metadata?.planId,
    userData.private_metadata?.plan_id,
    userData.private_metadata?.subscriptionPlan,
    userData.private_metadata?.subscription_plan,
  ];
  
  for (const source of planSources) {
    if (source && typeof source === 'string') {
      const planName = source.toLowerCase();
      if (planName.includes('start') || planName === 'start') {
        return 'start';
      } else if (planName.includes('pro') || planName === 'pro') {
        return 'pro';
      } else if (planName !== 'free') {
        return planName;
      }
    }
  }
  
  return 'free';
}

// Helper function to extract status from user data
function extractStatusFromUser(userData: any): string {
  if (!userData) return 'active';
  
  const statusSources = [
    userData.public_metadata?.subscriptionStatus,
    userData.public_metadata?.subscription_status,
    userData.private_metadata?.subscriptionStatus,
    userData.private_metadata?.subscription_status,
  ];
  
  for (const source of statusSources) {
    if (source && typeof source === 'string') {
      const status = source.toLowerCase();
      if (['active', 'canceled', 'cancelled', 'past_due'].includes(status)) {
        return status === 'cancelled' ? 'canceled' : status;
      }
    }
  }
  
  return 'active';
}

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

  // Check environment variables first
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY not configured');
    return new Response('Clerk secret key not configured', { status: 500 });
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

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
      
      // Initialize defaults
      let planId = 'free';
      let subscriptionStatus = 'active';
      
      // First, ensure user exists in database (do this efficiently)
      const { data: existingUser, error: userFetchError } = await supabase
        .from('users')
        .select('id')  // Only select id to minimize data transfer
        .eq('id', user_id)
        .single();
      
      // Get current user subscription from Clerk API (with timeout)
      console.log('Fetching current user subscription from Clerk API for user:', user_id);
      const clerkUser = await fetchClerkUser(user_id, 5000); // 5 second timeout
      
      if (clerkUser) {
        console.log('Clerk user data received for subscription check');
        planId = extractPlanFromUser(clerkUser);
        subscriptionStatus = extractStatusFromUser(clerkUser);
        console.log('Plan detected from Clerk API:', planId, 'Status:', subscriptionStatus);
        
        // If user doesn't exist in our database, create them
        if (userFetchError || !existingUser) {
          console.log('User not found in database, creating from Clerk data:', user_id);
          
          const userData = {
            id: clerkUser.id,
            first_name: clerkUser.first_name || null,
            last_name: clerkUser.last_name || null,
            email: clerkUser.email_addresses?.[0]?.email_address || '',
            display_name: clerkUser.first_name && clerkUser.last_name 
              ? `${clerkUser.first_name} ${clerkUser.last_name}`.trim()
              : clerkUser.first_name || clerkUser.last_name || null,
          };
          
          try {
            await upsertUser(userData);
            console.log('User created for subscription event:', user_id);
          } catch (userCreateError) {
            console.error('Error creating user:', userCreateError);
            // Continue with subscription update even if user creation fails
          }
        }
      } else {
        console.error('Failed to fetch user from Clerk API, using fallback logic');
        
        // Fallback: try to determine plan from webhook payload
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
        
        // For subscription.active events, assume it's not free
        if (eventType === 'subscription.active' && planId === 'free') {
          planId = 'start';
        }
        
        console.log('Fallback plan from webhook payload:', planId);
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