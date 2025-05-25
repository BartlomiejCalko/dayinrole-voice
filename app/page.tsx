"use client";

import { Hero } from '@/components/sections/Hero'
import { Navbar } from '@/components/shared/navbar'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'

const HomePage = () => {
  const { loading } = useAuthGuard({
    enableRedirect: false // Don't redirect from homepage
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
    </div>
  )
}

export default HomePage 