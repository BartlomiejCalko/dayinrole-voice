"use client";

import Agent from '@/components/Agent'
import React, { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface InterviewQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  category: string;
}

const InterviewContent = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [dayInRoleTitle, setDayInRoleTitle] = useState<string>('');
  const [dayInRoleId, setDayInRoleId] = useState<string>('');

  const handleBackToDayInRole = () => {
    if (dayInRoleId) {
      router.push(`/dayinrole/${dayInRoleId}`);
    } else {
      router.push('/dashboard');
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Extract questions from URL parameters
    const questionsParam = searchParams.get('questions');
    const titleParam = searchParams.get('dayInRoleTitle');
    const idParam = searchParams.get('dayInRoleId');
    
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

    if (idParam) {
      setDayInRoleId(idParam);
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
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Back Button */}
            <div className="flex justify-start mb-4">
              <Button
                variant="outline"
                onClick={handleBackToDayInRole}
                className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 rounded-full px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Day in Role 
              </Button>
            </div>
          </div>
          
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
        
      </div>
    </div>
  )
}

const InterviewPage = () => {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-background dark:bg-neutral-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  )
}

export default InterviewPage