"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';
import { getStripe } from '@/lib/stripe/client';
import { toast } from 'sonner';
import { Check, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PricingPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanSelection = async (priceId: string, planId: string) => {
    // If user is not authenticated, redirect to sign up
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // If user is authenticated, proceed with payment
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

  const getFeaturesList = (plan: any) => {
    const features = [
      `${plan.dayInRoleLimit} Day in Role sessions per month`,
      `${plan.interviewLimit} interview simulation${plan.interviewLimit > 1 ? 's' : ''} per month`,
      `${plan.questionsPerInterview} questions per interview`,
      'AI-powered job analysis',
      'Detailed career insights'
    ];

    if (plan.id === 'premium') {
      features.push('Email support', 'Detailed usage tracking');
    }

    return features;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the perfect plan to get detailed day-in-role insights for your next career move. 
          Start today and unlock your career potential.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Check className="w-4 h-4 text-green-500" />
          <span>Cancel anytime</span>
          <Check className="w-4 h-4 text-green-500 ml-4" />
          <span>No setup fees</span>
          <Check className="w-4 h-4 text-green-500 ml-4" />
          <span>Secure payments</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isBasic = plan.id === 'basic';
          const features = getFeaturesList(plan);
          
          return (
            <Card key={plan.id} className={`relative transition-all hover:shadow-xl ${
              !isBasic ? 'border-primary shadow-lg scale-105' : ''
            }`}>
              {!isBasic && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-5xl font-bold text-primary">
                  ${plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  {isBasic ? 'Perfect for getting started' : 'Best for serious job seekers'}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features list */}
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelection(plan.stripePriceId, plan.id)}
                  disabled={loading === plan.id || !isLoaded}
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
                  ) : (
                                         <div className="flex items-center space-x-2">
                       <span>{user ? 'Choose Plan' : 'Get Started'}</span>
                       <ArrowRight className="w-4 h-4" />
                     </div>
                  )}
                </Button>

                                 {!user && (
                   <p className="text-xs text-muted-foreground text-center">
                     Sign up required to get started
                   </p>
                 )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="grid gap-6">
                     <Card>
             <CardHeader>
               <CardTitle className="text-lg">How does billing work?</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 You'll be charged monthly starting immediately after signing up. 
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
                 Refunds are handled on a case-by-case basis. Please contact our support team 
                 if you have any issues with your subscription and we'll work to resolve them.
               </p>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16 p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-2xl">
                 <h3 className="text-2xl font-bold mb-4">Ready to Know Your Day in Role?</h3>
         <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
           Join thousands of professionals who use Day in Role to make informed career decisions. 
           Get started today.
         </p>
        {user ? (
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link href="/subscription">
              View Your Subscription
            </Link>
          </Button>
                 ) : (
           <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
             <Link href="/sign-in">
               Get Started
             </Link>
           </Button>
         )}
      </div>
    </div>
  );
};

export default PricingPage; 