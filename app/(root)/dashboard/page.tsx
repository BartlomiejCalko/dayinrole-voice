"use client";

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import DayInRoleCard from '@/components/DayInRoleCard'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'

const DashboardPage = () => {
  const { user, loading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  const [dayInRoles, setDayInRoles] = useState<DayInRole[]>([]);
  const [loadingDayInRoles, setLoadingDayInRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's day-in-role experiences
  const fetchDayInRoles = async () => {
    if (!user) return;

    setError(null);
    try {
      console.log('Fetching day-in-role data for user:', user.uid);
      const response = await fetch(`/api/dayinrole/user/${user.uid}`);
      
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
      fetchDayInRoles();
    }
  }, [user]);

  // Refresh function that can be called after creating new day-in-role
  const refreshDayInRoles = () => {
    setLoadingDayInRoles(true);
    fetchDayInRoles();
  };

  // Show loading state while checking authentication
  if (loading) {
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
        {/* CTA Section */}
        <section className="flex flex-row bg-gradient-to-b from-purple-900/20 to-blue-900/20 dark:from-purple-900/30 dark:to-blue-900/30 backdrop-blur-sm rounded-3xl px-16 py-6 items-center justify-between max-sm:px-4 max-sm:flex-col max-sm:gap-6 border border-white/10">
          <div className="flex flex-col gap-6 max-w-lg">
            <h2 className="text-3xl font-semibold text-foreground">Be familiar with a day in your new job</h2>
            <p className="text-lg text-muted-foreground">
              Get a glimpse of your future work life with our unique day-in-role
              experience. Explore the tasks, challenges, and culture of your
              potential workplace before you even step through the door.
            </p>
            <div className="flex gap-3 max-sm:flex-col">
              <Button asChild size="lg" className="max-sm:w-full">
                <Link href="/dayinrole/create">Create Day in Role</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={refreshDayInRoles}
                className="max-sm:w-full"
              >
                Refresh
              </Button>
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

        {/* Your Day in Role Experiences Section */}
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
                  <Button onClick={refreshDayInRoles}>
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
      </div>
    </div>
  );
}

export default DashboardPage