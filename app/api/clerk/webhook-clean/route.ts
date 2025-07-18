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
  user_id: string;
  plan_id?: string;
  status?: string;
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
  return 'user_id' in data;
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
  if (isClerkUser(data)) {
    const metadata = data.public_metadata;
    return metadata?.planId || metadata?.subscriptionPlan || 'free';
  } else {
    const metadata = data.public_metadata;
    return metadata?.planId || 'free';
  }
};

const handleSubscriptionEvent = async (data: ClerkUser | ClerkSubscription, eventType: string): Promise<void> => {
  let userId: string;
  
  if (isClerkUser(data)) {
    userId = data.id;
  } else if (isClerkSubscription(data)) {
    userId = data.user_id;
  } else {
    throw new Error('Invalid data for subscription event');
  }

  const planId = extractPlanId(data);
  const status = eventType.includes('deleted') ? 'canceled' : 'active';

  // Ensure user exists - but don't create from subscription data without user info
  const userExists = await userService.userExists(userId);
  if (!userExists) {
    console.log(`User ${userId} not found for subscription event, skipping`);
    return;
  }

  // Update or create subscription
  const existingSubscription = await subscriptionService.getSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    await subscriptionService.updateSubscription(userId, {
      plan_id: planId,
      status: status as 'active' | 'canceled' | 'past_due',
    });
  } else {
    await subscriptionService.createSubscription({
      user_id: userId,
      plan_id: planId,
      status: status as 'active' | 'canceled' | 'past_due',
    });
  }

  console.log(`Subscription ${eventType} processed for user ${userId}, plan: ${planId}`);
};

export async function POST(req: NextRequest) {
  try {
    // Verify webhook
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Missing headers', { status: 400 });
    }

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkEvent;

    // Handle events
    const { type, data } = evt;
    
    switch (type) {
      case 'user.created':
        if (isClerkUser(data)) {
          await createUser(data);
        }
        break;
        
      case 'user.updated':
        if (isClerkUser(data)) {
          await updateUser(data);
        }
        break;
        
      case 'user.deleted':
        await deleteUser(data.id);
        break;
        
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.deleted':
        await handleSubscriptionEvent(data, type);
        break;
        
      default:
        console.log('Unhandled event type:', type);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
} 