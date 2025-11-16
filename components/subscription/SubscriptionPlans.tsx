"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';
import Link from 'next/link';

interface SubscriptionPlansProps {
  currentPlanId?: string;
  showActions?: boolean;
}

export const SubscriptionPlans = ({ currentPlanId, showActions = true }: SubscriptionPlansProps) => {
  // Definiuj kolory dla każdego planu
  const planColors = {
    free: {
      gradient: 'from-blue-500 to-cyan-500',
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500',
    },
    start: {
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      border: 'border-purple-200 dark:border-purple-800',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-gradient-to-r from-purple-600 to-pink-600',
    },
  };

  // Filtruj tylko Free i Start plany
  const visiblePlans = SUBSCRIPTION_PLANS.filter(plan => plan.id === 'free' || plan.id === 'start');

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {visiblePlans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isFree = plan.id === 'free';
        const isStart = plan.id === 'start';
        const colors = isFree ? planColors.free : planColors.start;
        
        return (
          <Card 
            key={plan.id} 
            className={`relative transition-all hover:shadow-2xl hover:scale-105 ${
              isCurrentPlan ? 'ring-2 ring-offset-2 shadow-2xl' : ''
            } ${colors.border} ${isStart ? 'md:scale-105 z-10' : ''}`}
          >
            {isCurrentPlan && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className={`${colors.badge} text-white px-4 py-1 shadow-lg`}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Current plan
                </Badge>
              </div>
            )}
            
            {isStart && !isCurrentPlan && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-4 py-1 shadow-lg animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className={`text-center pb-4 space-y-2 ${colors.bg} rounded-t-lg`}>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isFree 
                  ? "Explore examples of Day in Role's and Interview Questions!"
                  : "Create your own 'Day in Role'. Perfect for getting started with role exploration."}
              </p>
              <div className={`text-5xl font-bold ${isFree ? 'text-gray-700 dark:text-gray-300' : `bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}`}>
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground block">
                  {isFree ? 'Always free' : '/month'}
                </span>
              </div>
              {!isFree && (
                <p className="text-xs text-muted-foreground">Only billed monthly</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              <ul className="space-y-4">
                {isFree ? (
                  <>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Examples of Day in Role</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Examples of Interview Questions related to Day in Role</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">
                        Up to <strong>{plan.dayInRoleLimit}</strong> day-in-role generations per month
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">
                        Up to <strong>{plan.interviewLimit}</strong> interview questions per day-in-role
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">AI-powered insights</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">Custom scenarios</span>
                    </li>
                  </>
                )}
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
                      className={`w-full h-12 text-lg font-semibold transition-all hover:scale-105 ${
                        isStart 
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-lg' 
                          : isFree
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg'
                          : ''
                      }`}
                      variant={isFree ? 'default' : 'default'}
                    >
                      <Link href="/subscription">
                        Subscribe
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