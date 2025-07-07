import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

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

  // Check if environment variables are available
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  console.log('Environment check:', {
    hasWebhookSecret: !!webhookSecret,
    hasClerkSecretKey: !!clerkSecretKey,
    webhookSecretLength: webhookSecret?.length || 0,
    clerkSecretKeyLength: clerkSecretKey?.length || 0
  });

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not found');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

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
    return new Response('Error verifying webhook', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type;
  const eventData = evt.data;
  
  console.log('TEST WEBHOOK - Event received:', {
    type: eventType,
    dataKeys: Object.keys(eventData || {}),
    userId: eventData?.id,
    timestamp: new Date().toISOString()
  });

  // For subscription events, log what data we receive
  if (eventType?.includes('subscription')) {
    console.log('TEST WEBHOOK - Subscription event data:', {
      eventType,
      hasUserId: !!eventData?.user_id,
      hasId: !!eventData?.id,
      hasCustomerId: !!eventData?.customer_id,
      hasMetadata: !!eventData?.metadata,
      hasPublicMetadata: !!eventData?.public_metadata,
      hasPrivateMetadata: !!eventData?.private_metadata,
      hasSubscriptionField: !!eventData?.subscription,
      fullEventData: eventData
    });
  }

  // For user.updated events, log metadata changes
  if (eventType === 'user.updated') {
    console.log('TEST WEBHOOK - User.updated event data:', {
      userId: eventData?.id,
      publicMetadata: eventData?.public_metadata,
      privateMetadata: eventData?.private_metadata,
      hasSubscriptionData: !!(eventData?.public_metadata?.planId || eventData?.public_metadata?.plan_id || eventData?.private_metadata?.planId),
      fullEventData: eventData
    });
  }

  return new Response('Test webhook processed successfully', { status: 200 });
} 