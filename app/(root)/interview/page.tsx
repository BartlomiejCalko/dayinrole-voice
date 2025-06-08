"use client";

import Agent from '@/components/Agent'
import React, { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

const InterviewPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[40%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-500/10 to-green-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <section className="flex flex-col gap-6 pt-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
              Interview <span className="text-gray-400">Generation</span>
            </h1>
            <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl dark:text-gray-400 mt-4">
              Practice your interview skills with our AI-powered interviewer. Get personalized feedback and improve your performance.
            </p>
          </div>
        </section>

        {/* Main Interview Section */}
        <section className="flex flex-col px-6 py-12">
          <Agent userName={user?.displayName || user?.email || 'You'} userId='user1' type='generate'/>
        </section>

        {/* Instructions Section */}
        <section className="flex flex-col gap-6 px-8 py-8">
          <h3 className="text-2xl font-semibold text-foreground text-center">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-foreground">Start the Call</h4>
              <p className="text-sm text-muted-foreground">Click the &ldquo;Call&rdquo; button to begin your AI-powered interview session.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-foreground">Answer Questions</h4>
              <p className="text-sm text-muted-foreground">Respond naturally to the AI interviewer&rsquo;s questions as you would in a real interview.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-foreground">Get Feedback</h4>
              <p className="text-sm text-muted-foreground">Receive detailed feedback on your performance and areas for improvement.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default InterviewPage