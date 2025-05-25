"use client";

import AuthForm from '@/components/AuthForm'
import React from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'

const Page = () => {
  const { loading } = useAuthGuard({
    redirectIfAuthenticated: true,
    redirectTo: '/dashboard',
    enableRedirect: true
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthForm type="sign-in"/>
}

export default Page