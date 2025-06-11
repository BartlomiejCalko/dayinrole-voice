"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';
import { getStripe } from '@/lib/stripe/client';
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  currentPlanId?: string;
}

export const SubscriptionPlans = ({ currentPlanId }: SubscriptionPlansProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoading(planId);
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment session');
      }
      
      const { sessionId } = await response.json();
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message || 'Payment redirect error');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating payment session');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isBasic = plan.id === 'basic';
        
        return (
          <Card key={plan.id} className={`relative transition-all hover:shadow-lg ${
            isCurrentPlan ? 'ring-2 ring-primary shadow-lg' : ''
          } ${!isBasic ? 'border-primary' : ''}`}>
            {isCurrentPlan && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Current plan
                </Badge>
              </div>
            )}
            
            {!isBasic && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-primary">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{plan.dayInRoleLimit} Day in Role monthly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{plan.interviewLimit} interviews per Day in Role</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Maximum {plan.questionsPerInterview} questions per interview</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Access to all features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Email support</span>
                </li>
              </ul>
              
              <Button
                onClick={() => handleSubscribe(plan.stripePriceId, plan.id)}
                disabled={loading === plan.id || isCurrentPlan}
                className={`w-full h-12 text-lg ${
                  !isBasic ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''
                }`}
                variant={isBasic ? 'outline' : 'default'}
              >
                {loading === plan.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : isCurrentPlan ? 'Current plan' : 'Choose plan'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}; 