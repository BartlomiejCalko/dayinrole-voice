import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { userService } from '@/lib/services/user.service';
import { subscriptionService } from '@/lib/services/subscription.service';

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
  public_metadata?: {
    planId?: string;
    subscriptionPlan?: string;
  };
}

interface ClerkSubscription {
  id: string;
  user_id?: string;
  plan_id?: string;
  status?: string;
  object: string;
  payer?: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  items?: Array<{
    status: string;
    plan: {
      name: string;
      slug: string;
      amount: number;
    };
  }>;
  public_metadata?: {
    planId?: string;
    plan?: string;
  };
}

interface ClerkEvent {
  type: string;
  data: ClerkUser | ClerkSubscription;
}

// Type guards
const isClerkUser = (data: ClerkUser | ClerkSubscription): data is ClerkUser => {
  return 'email_addresses' in data;
};

const isClerkSubscription = (data: ClerkUser | ClerkSubscription): data is ClerkSubscription => {
  return 'object' in data && data.object === 'commerce_subscription';
};

// User event handlers
const createUser = async (userData: ClerkUser): Promise<void> => {
  const user = await userService.createUser({
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email_addresses?.[0]?.email_address || '',
  });

  await subscriptionService.createFreeSubscription(user.id);
  console.log('User and subscription created successfully:', userData.id);
};

const updateUser = async (userData: ClerkUser): Promise<void> => {
  const user = await userService.getUserById(userData.id);
  if (!user) {
    console.log('User not found, creating new user:', userData.id);
    await createUser(userData);
    return;
  }

  // Update user data if it exists
  await userService.updateUser(userData.id, {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email_addresses?.[0]?.email_address || '',
  });

  console.log('User updated successfully:', userData.id);
};

const deleteUser = async (userId: string): Promise<void> => {
  await userService.deleteUser(userId);
  console.log('User deleted successfully:', userId);
};

// Subscription event handlers
const extractPlanId = (data: ClerkUser | ClerkSubscription): string => {
  console.log('🔍 EXTRACTING PLAN ID');
  console.log('🔍 Is ClerkUser:', isClerkUser(data));
  
  if (isClerkUser(data)) {
    const metadata = data.public_metadata;
    console.log('🔍 User metadata:', JSON.stringify(metadata || {}, null, 2));
    const planId = metadata?.planId || metadata?.subscriptionPlan || 'free';
    console.log('🔍 Final extracted planId from user:', planId);
    return planId;
  } else if (isClerkSubscription(data)) {
    // Extract from Clerk Commerce subscription items
    console.log('🔍 Subscription items:', JSON.stringify(data.items || [], null, 2));
    
    // Find the active subscription item
    const activeItem = data.items?.find(item => item.status === 'active');
    console.log('🔍 Active item found:', !!activeItem);
    
    if (activeItem) {
      // Map Clerk plan slugs to our plan IDs
      const planSlug = activeItem.plan.slug;
      console.log('🔍 Plan slug from active item:', planSlug);
      
      let planId = 'free';
      if (planSlug === 'start_plan' || planSlug.includes('start')) {
        planId = 'start';
      } else if (planSlug === 'pro_plan' || planSlug.includes('pro')) {
        planId = 'pro';
      } else if (planSlug === 'free' || activeItem.plan.amount === 0) {
        planId = 'free';
      }
      
      console.log('🔍 Mapped planId:', planId);
      return planId;
    }
    
    // Fallback to metadata if no active items
    const metadata = data.public_metadata;
    const planId = metadata?.planId || 'free';
    console.log('🔍 Fallback planId from metadata:', planId);
    return planId;
  }
  
  console.log('🔍 Default fallback to free');
  return 'free';
};

const handleSubscriptionEvent = async (data: ClerkUser | ClerkSubscription, eventType: string): Promise<void> => {
  console.log('🔥 SUBSCRIPTION EVENT HANDLER CALLED');
  console.log('🔥 Event Type:', eventType);
  console.log('🔥 Raw Data:', JSON.stringify(data, null, 2));
  
  let userId: string;
  
  if (isClerkUser(data)) {
    userId = data.id;
    console.log('🔥 Data is ClerkUser, userId:', userId);
  } else if (isClerkSubscription(data)) {
    userId = data.payer?.user_id || data.user_id || '';
    console.log('🔥 Data is ClerkSubscription, userId:', userId);
    console.log('🔥 Extracted from payer.user_id:', data.payer?.user_id);
  } else {
    console.log('🔥 ❌ Invalid data type for subscription event');
    throw new Error('Invalid data for subscription event');
  }

  const planId = extractPlanId(data);
  console.log('🔥 Extracted planId:', planId);
  
  const status = eventType.includes('deleted') ? 'canceled' : 'active';
  console.log('🔥 Calculated status:', status);

  // Ensure user exists - but don't create from subscription data without user info
  const userExists = await userService.userExists(userId);
  console.log('🔥 User exists in database:', userExists);
  
  if (!userExists) {
    console.log(`🔥 ❌ User ${userId} not found for subscription event, skipping`);
    return;
  }

  // Update or create subscription
  const existingSubscription = await subscriptionService.getSubscriptionByUserId(userId);
  console.log('🔥 Existing subscription:', existingSubscription ? 'FOUND' : 'NOT FOUND');
  
  if (existingSubscription) {
    console.log('🔥 UPDATING existing subscription with:', { plan_id: planId, status });
    const result = await subscriptionService.updateSubscription(userId, {
      plan_id: planId,
      status: status as 'active' | 'canceled' | 'past_due',
    });
    console.log('🔥 ✅ Subscription updated successfully:', result);
  } else {
    console.log('🔥 CREATING new subscription with:', { user_id: userId, plan_id: planId, status });
    const result = await subscriptionService.createSubscription({
      user_id: userId,
      plan_id: planId,
      status: status as 'active' | 'canceled' | 'past_due',
    });
    console.log('🔥 ✅ Subscription created successfully:', result);
  }

  console.log(`🔥 ✅ Subscription ${eventType} processed for user ${userId}, plan: ${planId}`);
};

export async function POST(req: NextRequest) {
  try {
    console.log('🚨 WEBHOOK CALLED - Timestamp:', new Date().toISOString());
    
    // Verify webhook
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.log('❌ Missing webhook headers');
      return new Response('Missing headers', { status: 400 });
    }

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.log('❌ CLERK_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log('📝 RAW WEBHOOK PAYLOAD:', JSON.stringify(payload, null, 2));

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkEvent;

    // Handle events
    const { type, data } = evt;
    console.log('🎯 EVENT TYPE:', type);
    console.log('📋 EVENT DATA:', JSON.stringify(data, null, 2));
    
    switch (type) {
      case 'user.created':
        console.log('👤 Processing user.created');
        if (isClerkUser(data)) {
          await createUser(data);
        }
        break;
        
      case 'user.updated':
        console.log('👤 Processing user.updated');
        if (isClerkUser(data)) {
          console.log('🔍 User metadata:', JSON.stringify(data.public_metadata, null, 2));
          await updateUser(data);
        }
        break;
        
      case 'user.deleted':
        console.log('👤 Processing user.deleted');
        await deleteUser(data.id);
        break;
        
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.deleted':
        console.log('💳 Processing subscription event:', type);
        console.log('💳 Subscription data:', JSON.stringify(data, null, 2));
        await handleSubscriptionEvent(data, type);
        break;
        
      default:
        console.log('❓ Unhandled event type:', type);
    }

    console.log('✅ Webhook processed successfully');
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('💥 Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
} 