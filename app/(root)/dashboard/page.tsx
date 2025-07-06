"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import DayInRoleCard from '@/components/DayInRoleCard'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { Crown, Lock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const DashboardPage = () => {
  const { user, loading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  const [dayInRoles, setDayInRoles] = useState<DayInRole[]>([]);
  const [sampleData, setSampleData] = useState<DayInRole[]>([]);
  const [loadingDayInRoles, setLoadingDayInRoles] = useState(true);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<{
    isFreePlan: boolean;
    planId: string;
    limits: SubscriptionLimits;
  } | null>(null);

  // Check user subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setUserSubscription({
          isFreePlan: !data.subscription || data.subscription.plan_id === 'free',
          planId: data.subscription?.plan_id || 'free',
          limits: data.limits || {
            dayInRoleLimit: 0,
            dayInRoleUsed: 0,
            interviewLimit: 0,
            interviewsUsed: 0,
            questionsPerInterview: 3,
            canGenerateDayInRole: false,
            canGenerateInterview: false
          }
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Default to free plan on error
      setUserSubscription({
        isFreePlan: true,
        planId: 'free',
        limits: {
          dayInRoleLimit: 0,
          dayInRoleUsed: 0,
          interviewLimit: 0,
          interviewsUsed: 0,
          questionsPerInterview: 3,
          canGenerateDayInRole: false,
          canGenerateInterview: false
        }
      });
    }
  };

  // Fetch sample data for all users
  const fetchSampleData = async () => {
    try {
      const response = await fetch('/api/dayinrole/samples');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSampleData(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching sample data:', error);
    } finally {
      setLoadingSamples(false);
    }
  };

  // Fetch user's day-in-role experiences (only for paid users)
  const fetchDayInRoles = async () => {
    if (!user || !userSubscription) return;

    // Skip fetching user data for free plan users
    if (userSubscription.isFreePlan) {
      setDayInRoles([]);
      setLoadingDayInRoles(false);
      return;
    }

    setError(null);
    try {
      console.log('Fetching day-in-role data for user:', user.id);
      const response = await fetch(`/api/dayinrole/user/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        console.log('Day-in-role data found:', result.data);
        setDayInRoles(result.data || []);
      } else {
        console.log('No day-in-role data found or API error:', result.message);
        setError(result.message || 'Failed to fetch data');
        setDayInRoles([]);
      }
    } catch (error) {
      console.error('Error fetching day in roles:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setDayInRoles([]);
    } finally {
      setLoadingDayInRoles(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      fetchDayInRoles();
    }
  }, [user]);

  // Refetch data when subscription status changes
  useEffect(() => {
    if (userSubscription) {
      fetchDayInRoles();
      fetchSampleData();
    }
  }, [userSubscription]);

  // Add visibility change listener to refresh subscription status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Refresh subscription status when user returns to the page
        checkSubscriptionStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Refresh subscription status and data
  const refreshData = async () => {
    if (user) {
      await checkSubscriptionStatus();
      await fetchDayInRoles();
      await fetchSampleData();
    }
  };

  // Manual subscription refresh (useful for testing and edge cases)
  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/subscription/refresh', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserSubscription({
            isFreePlan: data.isFreePlan,
            planId: data.planId,
            limits: data.limits
          });
          toast.success('Subscription status refreshed successfully!');
        }
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast.error('Failed to refresh subscription status');
    }
  };

  // Manual subscription sync with Stripe (fixes webhook issues)
  const syncSubscription = async () => {
    if (!user) return;
    
    try {
      toast.loading('Syncing subscription with Stripe...');
      
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserSubscription({
            isFreePlan: data.data.isFreePlan,
            planId: data.data.planId,
            limits: data.data.limits
          });
          
          if (data.data.syncedFromStripe) {
            toast.success('Subscription synced successfully with Stripe!');
          } else {
            toast.success('Subscription status updated!');
          }
        } else {
          toast.error('Failed to sync subscription');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to sync subscription');
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      toast.error('Failed to sync subscription with Stripe');
    }
  };

  const handleCreateClick = () => {
    if (userSubscription?.isFreePlan) {
      toast.error('Free plan users can only view examples. Please upgrade to create your own Day-in-Role experiences.');
      return;
    }
    // Allow navigation for paid users
    window.location.href = '/dayinrole/create';
  };

  // Show loading state while checking authentication
  if (loading || !userSubscription) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-neutral-950">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-neutral-950">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Free Plan Alert */}
        {userSubscription?.isFreePlan && (
          <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-2xl">You&apos;re on the Free Plan</CardTitle>
              </div>
              <CardDescription className="text-lg">
                You can explore example Day-in-Role experiences below. To create your own personalized experiences, upgrade to a paid plan.
              </CardDescription>
              <div className="flex gap-3 justify-center mt-4">
                <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Link href="/subscription">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/subscription">View Plans</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={refreshSubscription} className="text-xs">
                  Refresh Status
                </Button>
                <Button variant="ghost" size="sm" onClick={syncSubscription} className="text-xs">
                  Fix Subscription
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* CTA Section */}
        <section className="flex flex-row bg-gradient-to-b from-purple-900/20 to-blue-900/20 dark:from-purple-900/30 dark:to-blue-900/30 backdrop-blur-sm rounded-3xl px-16 py-6 items-center justify-between max-sm:px-4 max-sm:flex-col max-sm:gap-6 border border-white/10">
          <div className="flex flex-col gap-6 max-w-lg">
            <h2 className="text-3xl font-semibold text-foreground">
              {userSubscription?.isFreePlan ? 'Explore Examples of Day in Role' : 'Be familiar with a day in your new job'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {userSubscription?.isFreePlan 
                ? 'Browse through our curated examples to see what a Day-in-Role experience looks like. Upgrade to create your own personalized experiences.'
                : 'Get a glimpse of your future work life with our unique day-in-role experience. Explore the tasks, challenges, and culture of your potential workplace before you even step through the door.'
              }
            </p>
            <div className="flex gap-3 max-sm:flex-col">
              {userSubscription?.isFreePlan ? (
                <>
                  <Button 
                    onClick={handleCreateClick}
                    size="lg" 
                    className="max-sm:w-full relative"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Create Day in Role
                  </Button>
                  <Button asChild variant="outline" size="lg" className="max-sm:w-full">
                    <Link href="/subscription">Upgrade Plan</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="max-sm:w-full">
                    <Link href="/dayinrole/create">Create Day in Role</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={refreshData}
                    className="max-sm:w-full"
                  >
                    Refresh
                  </Button>
                </>
              )}
            </div>
          </div>
          <Image
            src="/robot.png"
            alt="robot"
            width={400}
            height={400}
            className="max-sm:hidden"
          />
        </section>

        {/* Your Day in Role Experiences Section (for paid users) */}
        {!userSubscription?.isFreePlan && (
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-semibold text-foreground">Your Day in Role Experiences</h2>
              <Button asChild variant="outline">
                <Link href="/dayinrole/create">+ Create New</Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 max-lg:flex-col w-full items-stretch">
              {loadingDayInRoles ? (
                <div className="flex items-center justify-center w-full py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading your experiences...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 w-full">
                  <div className="max-w-md mx-auto">
                    <div className="text-red-500 mb-4">
                      <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
                      <p className="text-sm">{error}</p>
                    </div>
                    <Button onClick={refreshData}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : dayInRoles.length > 0 ? (
                dayInRoles.map((dayInRole) => (
                  <DayInRoleCard 
                    key={dayInRole.id}
                    dayInRoleId={dayInRole.id}
                    companyName={dayInRole.companyName}
                    companyLogo={dayInRole.companyLogo}
                    position={dayInRole.position}
                    description={dayInRole.description}
                    challenges={dayInRole.challenges}
                    createdAt={dayInRole.createdAt}
                  />
                ))
              ) : (
                <div className="text-center py-12 w-full">
                  <div className="max-w-md mx-auto">
                    <Image 
                      src="/robot.png" 
                      alt="No experiences yet" 
                      width={120} 
                      height={120} 
                      className="mx-auto mb-6 opacity-50"
                    />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Day-in-Role Experiences Yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first day-in-role experience by pasting a job offer description. 
                      Get insights into what your typical workday might look like!
                    </p>
                    <Button asChild size="lg">
                      <Link href="/dayinrole/create">Create Your First Experience</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Sample Day in Role Experiences Section (only for Free plan users) */}
        {userSubscription?.isFreePlan && (
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Example Day-in-Role Experiences
                </h2>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Examples
                </Badge>
              </div>
              <Button asChild>
                <Link href="/subscription">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Create Your Own
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 max-lg:flex-col w-full items-stretch">
              {loadingSamples ? (
                <div className="flex items-center justify-center w-full py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading examples...</span>
                </div>
              ) : sampleData.length > 0 ? (
                sampleData.map((dayInRole) => (
                  <DayInRoleCard 
                    key={dayInRole.id}
                    dayInRoleId={dayInRole.id}
                    companyName={dayInRole.companyName}
                    companyLogo={dayInRole.companyLogo}
                    position={dayInRole.position}
                    description={dayInRole.description}
                    challenges={dayInRole.challenges}
                    createdAt={dayInRole.createdAt}
                  />
                ))
              ) : (
                <div className="text-center py-12 w-full">
                  <div className="max-w-md mx-auto">
                    <Image 
                      src="/robot.png" 
                      alt="No samples available" 
                      width={120} 
                      height={120} 
                      className="mx-auto mb-6 opacity-50"
                    />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Sample Experiences Available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Sample experiences are currently being prepared. Please check back later.
                    </p>
                    <Button onClick={refreshData}>
                      Refresh
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default DashboardPage