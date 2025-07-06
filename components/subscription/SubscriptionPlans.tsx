"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { SUBSCRIPTION_PLANS, getPlanById } from '@/constants/subscription-plans';
import Link from 'next/link';

interface SubscriptionPlansProps {
  currentPlanId?: string;
  showActions?: boolean;
}

export const SubscriptionPlans = ({ currentPlanId, showActions = true }: SubscriptionPlansProps) => {
  const currentPlan = currentPlanId ? getPlanById(currentPlanId) : null;

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free').map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isPro = plan.id === 'pro';
        
        return (
          <Card key={plan.id} className={`relative transition-all hover:shadow-lg ${
            isCurrentPlan ? 'ring-2 ring-primary shadow-lg' : ''
          } ${isPro ? 'border-primary' : ''}`}>
            {isCurrentPlan && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Current plan
                </Badge>
              </div>
            )}
            
            {isPro && (
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
              
              {showActions && (
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full h-12 text-lg"
                      variant="outline"
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className={`w-full h-12 text-lg ${
                        isPro ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''
                      }`}
                      variant={isPro ? 'default' : 'outline'}
                    >
                      <Link href="/subscription">
                        Choose {plan.name}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}; 