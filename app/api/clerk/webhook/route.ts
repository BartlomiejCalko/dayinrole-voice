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

// Helper: map Clerk Commerce plan slugs to our plan ids
function mapPlanSlugToPlanId(slug: string | undefined, amount?: number): string {
  if (!slug && amount === 0) return 'free';
  const normalized = (slug || '').toLowerCase();
  if (normalized.includes('start')) return 'start';
  if (normalized.includes('pro')) return 'pro';
  return amount === 0 ? 'free' : 'free';
}

// Helper: extract plan from subscription-like payloads (Clerk Commerce)
function extractPlanFromSubscriptionPayload(data: any): string {
  try {
    const items = data?.items as Array<any> | undefined;
    if (Array.isArray(items) && items.length > 0) {
      const activeItem = items.find(i => (i?.status || '').toLowerCase() === 'active') || items[0];
      const slug = activeItem?.plan?.slug;
      const amount = activeItem?.plan?.amount;
      const planId = mapPlanSlugToPlanId(slug, amount);
      if (planId) return planId;
    }
    // Fallback to metadata
    const fromMeta = data?.public_metadata?.planId || data?.public_metadata?.plan || data?.plan_id;
    if (typeof fromMeta === 'string') return extractPlanFromUser({ public_metadata: { planId: fromMeta } });
  } catch (e) {
    console.error('Error extracting plan from subscription payload:', e);
  }
  return 'free';
}

// Helper: extract user id from diverse Clerk event payload shapes
function extractUserIdFromEventData(eventData: any): string | null {
  if (!eventData) return null;
  // Direct fields
  if (typeof eventData.user_id === 'string') return eventData.user_id;
  if (typeof eventData.customer_id === 'string') return eventData.customer_id;
  if (typeof eventData.id === 'string' && eventData.public_metadata) return eventData.id;
  // Payer object (Clerk Commerce)
  if (eventData.payer && typeof eventData.payer.user_id === 'string') return eventData.payer.user_id;
  // Nested subscription object
  if (eventData.subscription) {
    const sub = eventData.subscription;
    if (typeof sub.user_id === 'string') return sub.user_id;
    if (typeof sub.customer_id === 'string') return sub.customer_id;
  }
  return null;
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
  const headerPayload = await headers();
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
      
    } else if (eventType === 'user.updated') {
      console.log('Processing user.updated event - checking for subscription changes');
      const { id } = eventData;
      
      if (!id) {
        console.error('No user ID found in user.updated event');
        return new Response('No user ID found', { status: 400 });
      }
      
      // For user.updated events, the eventData IS the user data
      const planId = extractPlanFromUser(eventData);
      const subscriptionStatus = extractStatusFromUser(eventData);
      
      console.log('Plan detected from user.updated event:', planId, 'Status:', subscriptionStatus);
      
      // Only proceed if this looks like a subscription change (not a free plan)
      if (planId !== 'free') {
        const supabase = createServiceClient();
        
        // Update subscription in database
        const subscriptionData = {
          user_id: id,
          plan_id: planId,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          status: subscriptionStatus as 'active' | 'canceled' | 'past_due',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          cancel_at_period_end: false,
        };
        
        console.log('Upserting subscription from user.updated:', subscriptionData);
        
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });
        
        if (subError) {
          console.error('Error updating subscription from user.updated:', subError);
        } else {
          console.log('Subscription updated successfully from user.updated:', { user_id: id, planId, status: subscriptionStatus });
        }
      } else {
        console.log('User.updated event shows free plan, skipping subscription update');
      }
      
    } else if (eventType.startsWith('subscriptionItem.')) {
      console.log('Processing subscriptionItem event:', eventType);
      console.log('Event data keys:', Object.keys(eventData));
      
      // For subscriptionItem events, we need to find the user_id
      let user_id = extractUserIdFromEventData(eventData);
      
      if (!user_id) {
        console.error('No user_id found in subscriptionItem event:', eventData);
        return new Response('No user_id found', { status: 400 });
      }
      
      console.log('Processing subscriptionItem for user:', user_id);
      
      // Prefer deriving plan directly from subscription payload to avoid API latency
      let planId = extractPlanFromSubscriptionPayload(eventData);
      // Map subscriptionItem events to our status
      let finalStatus: 'active' | 'canceled' | 'past_due' = 'active';
      if (eventType === 'subscriptionItem.canceled' || eventType === 'subscriptionItem.ended') {
        finalStatus = 'canceled';
      } else if (eventType === 'subscriptionItem.active') {
        finalStatus = 'active';
      }
      
      // If plan couldn't be determined from payload, fetch from Clerk user as fallback
      if (!planId || planId === 'free') {
        const clerkUser = await fetchClerkUser(user_id, 5000);
        if (clerkUser) {
          planId = extractPlanFromUser(clerkUser) || planId;
        }
      }
      
      console.log('Plan from subscriptionItem event:', planId, 'Status:', finalStatus);
      
      const supabase = createServiceClient();
      
      const subscriptionData = {
        user_id: user_id,
        plan_id: planId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: finalStatus as 'active' | 'canceled' | 'past_due',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: eventType === 'subscriptionItem.canceled' || eventType === 'subscriptionItem.ended',
      };
      
      console.log('Upserting subscription from subscriptionItem:', subscriptionData);
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
      if (subError) {
        console.error('Error updating subscription from subscriptionItem:', subError);
      } else {
        console.log('Subscription updated successfully from subscriptionItem:', { user_id, planId, status: finalStatus });
      }
      
    } else if (eventType === 'subscription.created' || eventType === 'subscription.updated' || eventType === 'subscription.active') {
      console.log('Processing subscription event:', eventType);
      console.log('Event data keys:', Object.keys(eventData));
      
      // Extract user_id from multiple possible locations (including payer)
      let user_id = extractUserIdFromEventData(eventData);
      
      if (!user_id) {
        console.error('No user_id found in subscription event:', eventData);
        return new Response('No user_id found', { status: 400 });
      }
      
      console.log('Processing subscription for user:', user_id);
      
      const supabase = createServiceClient();
      
      // Initialize defaults
      let planId = extractPlanFromSubscriptionPayload(eventData) || 'free';
      let subscriptionStatus = 'active';
      
      // Ensure user exists in database (lightweight check)
      const { data: existingUser, error: userFetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user_id)
        .single();
      
      // If plan not resolved or still free, consult Clerk user as source of truth
      if (!planId || planId === 'free') {
        console.log('Fetching current user subscription from Clerk API for user:', user_id);
        const clerkUser = await fetchClerkUser(user_id, 5000);
        if (clerkUser) {
          planId = extractPlanFromUser(clerkUser) || planId;
          subscriptionStatus = extractStatusFromUser(clerkUser) || subscriptionStatus;
          console.log('Plan detected from Clerk API:', planId, 'Status:', subscriptionStatus);
        }
      }
      
      // If user doesn't exist in our database, create them (best-effort)
      if (userFetchError || !existingUser) {
        console.log('User not found in database, creating from subscription event data:', user_id);
        try {
          // Minimal fields; if Clerk fetch already happened, prefer those values
          let firstName = null, lastName = null, email = '';
          if (eventData?.payer) {
            firstName = eventData.payer.first_name || null;
            lastName = eventData.payer.last_name || null;
            email = eventData.payer.email || '';
          }
          await upsertUser({
            id: user_id,
            first_name: firstName,
            last_name: lastName,
            email,
            display_name: firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || null,
          });
        } catch (userCreateError) {
          console.error('Error creating user from subscription event:', userCreateError);
        }
      }
      
      console.log('Final determined plan ID:', planId, 'from event type:', eventType);
      
      // Use the subscription status we got from Clerk API or default
      let status: 'active' | 'canceled' | 'past_due' = subscriptionStatus as 'active' | 'canceled' | 'past_due';
      
      // Fallback to webhook event data if we didn't get status from Clerk API
      if (status === 'active' && eventData.status) {
        const eventStatus = String(eventData.status).toLowerCase();
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
        cancel_at_period_end: !!eventData.cancel_at_period_end,
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