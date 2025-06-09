"use client";

import Agent from '@/components/Agent'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'

interface InterviewQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  category: string;
}

const InterviewPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [dayInRoleTitle, setDayInRoleTitle] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Extract questions from URL parameters
    const questionsParam = searchParams.get('questions');
    const titleParam = searchParams.get('dayInRoleTitle');
    
    if (questionsParam) {
      try {
        const parsedQuestions = JSON.parse(questionsParam);
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error('Error parsing questions:', error);
      }
    }
    
    if (titleParam) {
      setDayInRoleTitle(titleParam);
    }
  }, [searchParams]);

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
              Interview <span className="text-gray-400">Practice</span>
            </h1>
            <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl dark:text-gray-400 mt-4">
              Practice your interview skills with personalized questions and professional sample answers tailored to your role.
            </p>
          </div>
        </section>

        {/* Main Interview Section */}
        <section className="flex flex-col px-6 py-12">
          <Agent questions={questions} dayInRoleTitle={dayInRoleTitle} />
        </section>

        {/* Instructions Section */}
        <section className="flex flex-col gap-6 px-8 py-8">
          <h3 className="text-2xl font-semibold text-foreground text-center">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-foreground">Review Questions</h4>
              <p className="text-sm text-muted-foreground">Browse through personalized interview questions generated specifically for your role.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-foreground">Practice Answers</h4>
              <p className="text-sm text-muted-foreground">Think through your responses and reveal sample answers to learn best practices.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-foreground">Improve Skills</h4>
              <p className="text-sm text-muted-foreground">Learn from professional examples and boost your confidence for real interviews.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default InterviewPage