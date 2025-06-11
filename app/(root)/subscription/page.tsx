"use client";

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { UsageTracker } from '@/components/subscription/UsageTracker';
import { SubscriptionManagement } from '@/components/subscription/SubscriptionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const SubscriptionPageContent = () => {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle success/cancel from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      toast.success('Subscription activated successfully!');
      // Clear URL parameters
      window.history.replaceState({}, '', '/subscription');
    } else if (canceled === 'true') {
      toast.error('Payment was cancelled.');
      // Clear URL parameters
      window.history.replaceState({}, '', '/subscription');
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/subscription/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription information');
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to fetch subscription information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchSubscription();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
        <div className="grid gap-6 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to manage your subscription.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Manage Subscription
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Check your usage, manage your plan and get access to all Day in Role features.
        </p>
      </div>

      {/* Success message for active subscription */}
      {subscription?.status === 'active' && (
        <Alert className="max-w-4xl mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription is active. You can use all Day in Role features.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content grid */}
      <div className="max-w-6xl mx-auto grid gap-8">
        {/* Usage tracking - only show if user has subscription */}
        {subscription && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Usage</h2>
            <UsageTracker userId={user.uid} />
          </div>
        )}

        {/* Subscription management - only show if user has subscription */}
        {subscription && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Subscription Status</h2>
            <SubscriptionManagement 
              subscription={subscription}
              onSubscriptionUpdate={fetchSubscription}
            />
          </div>
        )}

        {/* Subscription plans */}
        <div>
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold">
              {subscription ? 'Change Plan' : 'Choose Plan'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {subscription 
                ? 'Upgrade to a higher plan to get access to more Day in Role sessions and interviews.'
                : 'Start today and get access to personalized Day in Role simulations.'}
            </p>
          </div>
          
          <SubscriptionPlans currentPlanId={subscription?.planId} />
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When will I be charged?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You will be charged automatically every month on the day you activated your subscription. 
                  You can cancel your subscription at any time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after cancellation?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  After cancellation, you will still have access to features until the end of the current billing period. 
                  Your data will remain safe and you can reactivate your subscription at any time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan at any time?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade to a higher plan at any time. The change will be applied immediately 
                  and you will be charged proportionally.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 7-day money-back guarantee for new subscriptions. 
                  Contact us at support@dayinrole.com.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <SubscriptionPageContent />
    </Suspense>
  );
};

export default SubscriptionPage; 