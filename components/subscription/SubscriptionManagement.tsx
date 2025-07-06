"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Crown,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';

interface SubscriptionManagementProps {
  subscription: UserSubscription | null;
  onSubscriptionUpdate: () => void;
}

export const SubscriptionManagement = ({ 
  subscription, 
  onSubscriptionUpdate 
}: SubscriptionManagementProps) => {
  const [canceling, setCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will have access to features until the end of your current billing period.'
    );

    if (!confirmed) return;

    setCanceling(true);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      const result = await response.json();
      
      // Handle different subscription types
      if (result.type === 'clerk' && result.requiresManualCancellation) {
        // For Clerk subscriptions, show instructions
        toast.success('Cancellation request processed', {
          description: 'To complete cancellation, go to your account settings and cancel subscription in the billing section.',
          duration: 8000,
        });
        
        // Also show an alert with instructions
        setTimeout(() => {
          alert(
            'Important: To complete subscription cancellation, you must:\n\n' +
            '1. Click on your profile (avatar) in the top right corner\n' +
            '2. Select "Manage Account"\n' +
            '3. Go to the "Billing" section\n' +
            '4. Cancel your subscription\n\n' +
            'Your subscription will remain active until the end of the current billing period.'
          );
        }, 1000);
      } else {
        // For Stripe subscriptions (standard success)
        toast.success(result.message || 'Subscription has been cancelled');
      }
      
      onSubscriptionUpdate();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while canceling subscription');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusBadge = (status: string, cancel_at_period_end: boolean | null) => {
    if (cancel_at_period_end) {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Cancelling
        </Badge>
      );
    }

    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Past Due
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unpaid
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return SUBSCRIPTION_PLANS.find(plan => plan.id === subscription.plan_id);
  };

  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Active Subscription</h3>
              <p className="text-muted-foreground">
                Choose a plan below to start using Day in Role features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = getCurrentPlan();
  const isPro = subscription.plan_id === 'pro';

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <Card className="relative overflow-hidden">
        {isPro && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
        )}
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              {isPro ? (
                <Crown className="w-6 h-6 text-purple-600" />
              ) : (
                <Shield className="w-6 h-6 text-blue-600" />
              )}
              <span className="text-2xl font-bold">Current Subscription</span>
            </CardTitle>
            {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className={`relative p-6 rounded-xl border-2 ${
            isPro 
              ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800' 
              : 'bg-muted/30 border-muted'
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {isPro && <Zap className="w-5 h-5 text-purple-600" />}
                  <h3 className="text-2xl font-bold">
                    {currentPlan?.name || 'Unknown Plan'}
                  </h3>
                </div>
                <p className="text-xl font-semibold text-muted-foreground">
                  ${currentPlan?.price}/month
                </p>
              </div>
              {isPro && (
                <div className="text-right">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Billing Period */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Billing Period Start</span>
              </div>
              <p className="text-lg font-semibold pl-6">
                {formatDate(subscription.current_period_start)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Next Billing Date</span>
              </div>
              <p className="text-lg font-semibold pl-6">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {/* Plan Features */}
          {currentPlan && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">What's included in your plan:</h4>
              <div className="grid gap-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{currentPlan.dayInRoleLimit} Day in Role sessions per month</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{currentPlan.interviewLimit} interviews per Day in Role</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Up to {currentPlan.questionsPerInterview} questions per interview</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Alerts */}
      <div className="space-y-4">
        {/* Clerk Billing Notice */}
        {(!subscription.stripe_subscription_id || !subscription.stripe_customer_id) && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Billing Management:</strong> Your subscription is managed through your account billing system. 
              To manage payments or cancel your subscription, go to the "Billing" section in your account settings 
              (click your profile → Manage Account → Billing).
            </AlertDescription>
          </Alert>
        )}

        {/* Cancellation Warning */}
        {subscription.cancel_at_period_end && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Subscription Ending:</strong> Your subscription will be cancelled on {formatDate(subscription.current_period_end)}. 
              You'll continue to have access to all features until then.
            </AlertDescription>
          </Alert>
        )}

        {/* Past Due Warning */}
        {subscription.status === 'past_due' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Overdue:</strong> Your subscription has an overdue payment. Please update your payment method to continue using the service.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {subscription.status === 'active' && !subscription.cancel_at_period_end && (
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="flex items-center space-x-2"
              >
                {canceling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>
                      {(!subscription.stripe_subscription_id || !subscription.stripe_customer_id) 
                        ? 'Start Cancellation' 
                        : 'Cancel Subscription'}
                    </span>
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" asChild>
              <a href="mailto:support@dayinrole.com" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 