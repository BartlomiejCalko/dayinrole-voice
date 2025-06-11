import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { checkSubscriptionLimits } from '@/lib/subscription/queries';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();
    const limits = await checkSubscriptionLimits(user.uid);
    
    return Response.json({ limits });
  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 