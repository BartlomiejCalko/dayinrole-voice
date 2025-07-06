import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { 
  createSubscription, 
  updateSubscriptionStatus, 
  updateSubscriptionByUserId,
  getSubscriptionByUserId 
} from '@/lib/subscription/queries';

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  try {
    console.log('Processing subscription created event:', subscription.id);
    
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('Missing userId or planId in subscription metadata:', {
        userId,
        planId,
        metadata: subscription.metadata
      });
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
    console.log('Processing subscription updated event:', subscription.id);
    
    const updates: any = {
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    };

    // Also update plan_id if it's in metadata (for plan changes)
    if (subscription.metadata?.planId) {
      updates.plan_id = subscription.metadata.planId;
    }

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
    console.log('Processing subscription deleted event:', subscription.id);
    
    await updateSubscriptionStatus(subscription.id, 'canceled');
    console.log('Subscription canceled successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
};

const handlePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  try {
    console.log('Processing payment succeeded event:', invoice.id);
    
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      
      const updates: any = {
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      };

      // Update plan_id if it's in metadata (for plan changes)
      if (subscription.metadata?.planId) {
        updates.plan_id = subscription.metadata.planId;
      }

      await updateSubscriptionStatus(
        subscription.id,
        'active',
        updates
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
    console.log('Processing checkout session completed event:', session.id);
    console.log('Session metadata:', session.metadata);
    console.log('Session subscription:', session.subscription);
    console.log('Session customer:', session.customer);
    
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('Missing required metadata in checkout session:', {
        userId,
        planId,
        metadata: session.metadata
      });
      return;
    }

    if (!session.subscription) {
      console.error('No subscription ID in checkout session:', session.id);
      return;
    }

    // Get the full subscription object from Stripe to ensure we have complete data
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log('Retrieved subscription from Stripe:', stripeSubscription.id);

    // Check if subscription already exists
    const existingSubscription = await getSubscriptionByUserId(userId);
    console.log('Existing subscription found:', existingSubscription?.id);
    
    if (existingSubscription) {
      // Update existing subscription (likely upgrading from free to paid)
      const updateData = {
        plan_id: planId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        status: 'active' as const,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: false,
      };
      
      console.log('Updating existing subscription with data:', updateData);
      
      await updateSubscriptionByUserId(userId, updateData);
      console.log('Existing subscription upgraded successfully:', existingSubscription.id);
    } else {
      // Create new subscription
      console.log('Creating new subscription for user:', userId);
      
      const newSubscriptionId = await createSubscription(
        userId,
        session.customer as string,
        session.subscription as string,
        planId
      );
      console.log('New subscription created:', newSubscriptionId);
    }

    console.log('Checkout session completed successfully:', session.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    console.error('Session details:', {
      sessionId: session.id,
      userId: session.metadata?.userId,
      planId: session.metadata?.planId,
      subscription: session.subscription,
      customer: session.customer
    });
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

  console.log('Processing webhook event:', event.type, 'Event ID:', event.id);

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

    console.log('Successfully processed webhook event:', event.type, 'Event ID:', event.id);
    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', event.type, 'Error:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 