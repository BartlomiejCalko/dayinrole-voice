import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { checkSubscriptionLimits } from './queries';

export const requireActiveSubscription = async (req: NextRequest) => {
  try {
    const user = await verifyAuth();
    const limits = await checkSubscriptionLimits(user.uid);
    
    if (!limits.canGenerateDayInRole && !limits.canGenerateInterview) {
      return NextResponse.json(
        { 
          error: 'Active subscription required',
          message: 'Musisz mieć aktywną subskrypcję, aby korzystać z tej funkcji.',
          limits 
        },
        { status: 403 }
      );
    }
    
    return null; // Continue with request
  } catch (error) {
    console.error('Auth error in requireActiveSubscription:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
};

export const requireDayInRoleLimit = async (req: NextRequest) => {
  try {
    const user = await verifyAuth();
    const limits = await checkSubscriptionLimits(user.uid);
    
    if (!limits.canGenerateDayInRole) {
      return NextResponse.json(
        { 
          error: 'Day in role limit exceeded',
          message: `Wykorzystałeś limit ${limits.dayInRoleLimit} Day in Role w tym miesiącu. Zaktualizuj plan lub poczekaj na następny miesiąc.`,
          limits 
        },
        { status: 403 }
      );
    }
    
    return null;
  } catch (error) {
    console.error('Auth error in requireDayInRoleLimit:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
};

export const requireInterviewLimit = async (req: NextRequest) => {
  try {
    const user = await verifyAuth();
    const limits = await checkSubscriptionLimits(user.uid);
    
    if (!limits.canGenerateInterview) {
      return NextResponse.json(
        { 
          error: 'Interview limit exceeded',
          message: `Wykorzystałeś limit ${limits.interviewLimit} wywiadów w tym miesiącu. Zaktualizuj plan lub poczekaj na następny miesiąc.`,
          limits 
        },
        { status: 403 }
      );
    }
    
    return null;
  } catch (error) {
    console.error('Auth error in requireInterviewLimit:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
};

export const withSubscriptionCheck = (
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  checkType: 'dayinrole' | 'interview' | 'any' = 'any'
) => {
  return async (req: NextRequest) => {
    let middlewareResult;
    
    switch (checkType) {
      case 'dayinrole':
        middlewareResult = await requireDayInRoleLimit(req);
        break;
      case 'interview':
        middlewareResult = await requireInterviewLimit(req);
        break;
      default:
        middlewareResult = await requireActiveSubscription(req);
    }
    
    if (middlewareResult) {
      return middlewareResult;
    }
    
    try {
      const user = await verifyAuth();
      return await handler(req, user);
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}; 