import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { 
  createSubscription, 
  updateSubscriptionStatus, 
  getSubscriptionByUserId 
} from '@/lib/subscription/queries';

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  try {
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('Missing userId or planId in subscription metadata');
      return;
    }

    await createSubscription(
      userId,
      subscription.customer as string,
      subscription.id,
      planId
    );

    console.log('Subscription created successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  try {
    const updates: any = {
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    await updateSubscriptionStatus(
      subscription.id,
      subscription.status as any,
      updates
    );

    console.log('Subscription updated successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  try {
    await updateSubscriptionStatus(subscription.id, 'canceled');
    console.log('Subscription canceled successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
};

const handlePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      await updateSubscriptionStatus(
        subscription.id,
        'active',
        {
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        }
      );
      console.log('Payment succeeded, subscription updated:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
};

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  try {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    
    if (!userId || !planId || !session.subscription) {
      console.error('Missing required data in checkout session');
      return;
    }

    // Check if subscription already exists (in case webhook fired multiple times)
    const existingSubscription = await getSubscriptionByUserId(userId);
    if (!existingSubscription) {
      await createSubscription(
        userId,
        session.customer as string,
        session.subscription as string,
        planId
      );
    }

    console.log('Checkout session completed successfully:', session.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return new Response('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  console.log('Processing webhook event:', event.type);

  try {
    // Handle subscription events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        if (event.data.object.subscription) {
          await updateSubscriptionStatus(
            event.data.object.subscription as string,
            'past_due'
          );
        }
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 