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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <>
      <h3>Interview generation</h3>
      <Agent userName='You' userId='user1' type='generate'/>
    </>
  )
}

export default InterviewPage