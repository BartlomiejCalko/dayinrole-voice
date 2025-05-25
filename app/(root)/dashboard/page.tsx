"use client";

import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import InterviewCard from '@/components/InerviewCard'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'

const DashboardPage = () => {
  const { user, loading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-neutral-950">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/interview">Start Interview</Link>
            </Button>
          </div>
          <Image
            src="/robot.png"
            alt="robot"
            width={400}
            height={400}
            className="max-sm:hidden"
          />
        </section>

        {/* Your Interviews Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold text-foreground">Your interviews</h2>
          <div className="flex flex-wrap gap-4 max-lg:flex-col w-full items-stretch">
            {dummyInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))}
            <p className="text-muted-foreground">You haven&apos;t taken an interview yet</p>
          </div>
        </section>

        {/* Take an Interview Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold text-foreground">Take an interview</h2>
          <div className="flex flex-wrap gap-4 max-lg:flex-col w-full items-stretch">
            {dummyInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage 