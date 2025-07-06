"use client";

import { Suspense, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PricingTable } from '@clerk/nextjs';
import { UsageTracker } from '@/components/subscription/UsageTracker';
import { SubscriptionManagement } from '@/components/subscription/SubscriptionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const SubscriptionPageContent = () => {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle success/cancel from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      toast.success('Subscription activated successfully!');
      // Clear URL parameters
      window.history.replaceState({}, '', '/subscription');
      
      // Refresh subscription status after a short delay to allow webhook processing
      setTimeout(() => {
        fetchSubscription();
      }, 2000);
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
    if (user && isLoaded) {
      fetchSubscription();
    }
  }, [user, isLoaded]);

  // Show loading only when we're checking user authentication state
  if (!isLoaded) {
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

  return (
    <div className="container mx-auto py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {user && subscription ? 'Manage Subscription' : 'Choose Your Plan'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {user && subscription 
            ? 'Check your usage, manage your plan and get access to all Day in Role features.'
            : 'Choose the perfect plan to get detailed day-in-role insights for your next career move. Start today and unlock your career potential.'}
        </p>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure payments</span>
          </div>
        </div>
      </div>

      {/* Success message for active subscription - only for authenticated users */}
      {user && subscription?.status === 'active' && (
        <Alert className="max-w-4xl mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription is active. You can use all Day in Role features.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage tracking - only show if user has subscription and is loading subscription data */}
      {user && loading && (
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Usage tracking - only show if user has subscription */}
      {user && subscription && !loading && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Usage</h2>
          <UsageTracker userId={user.id} />
        </div>
      )}

      {/* Subscription management - only show if user has subscription */}
      {user && subscription && !loading && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Current Subscription</h2>
          <SubscriptionManagement 
            subscription={subscription}
            onSubscriptionUpdate={fetchSubscription}
          />
        </div>
      )}

      {/* Pricing Table using Clerk's component - visible to everyone */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold">
            {user && subscription ? 'Change Plan' : 'Pricing Plans'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {user && subscription 
              ? 'Upgrade to a higher plan to get access to more Day in Role sessions and interviews.'
              : 'Start today and get access to personalized Day in Role simulations.'}
          </p>
          {!user && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                                 💡 <strong>Sign in required:</strong> You&apos;ll need to create an account to subscribe to a plan and start using Day in Role.
              </p>
            </div>
          )}
        </div>
        
        <PricingTable 
          newSubscriptionRedirectUrl="/subscription?success=true"
          fallback={
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          }
        />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does billing work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You&apos;ll be charged monthly starting immediately after signing up. 
                You can cancel your subscription at any time and retain access until the end of your billing period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When will I be charged?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You will be charged automatically every month on the day you activated your subscription. 
                You can cancel your subscription at any time from your account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What happens after cancellation?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                After cancellation, you will still have access to all features until the end of your current billing period. 
                Your data remains safe and you can reactivate your subscription anytime.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change my plan later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time from your subscription settings. 
                Changes take effect immediately and billing is prorated accordingly.
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
                Contact us at support@dayinrole.com for any billing questions.
              </p>
            </CardContent>
          </Card>
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