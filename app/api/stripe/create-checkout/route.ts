import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { verifyAuth } from '@/lib/auth/verify';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';

export async function POST(req: NextRequest) {
  try {
    const { priceId, planId } = await req.json();
    const user = await verifyAuth();

    if (!priceId || !planId) {
      return Response.json(
        { error: 'Price ID and Plan ID are required' },
        { status: 400 }
      );
    }

    // Verify that the plan exists
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId && p.stripePriceId === priceId);
    if (!plan) {
      return Response.json(
        { error: 'Invalid plan or price ID' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email || undefined,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription?canceled=true`,
      metadata: {
        userId: user.uid,
        planId: planId,
      },
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Error) {
      return Response.json(
        { error: 'Failed to create checkout session', details: error.message },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 