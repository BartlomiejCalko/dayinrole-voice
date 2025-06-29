"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  redirectIfAuthenticated?: boolean;
  enableRedirect?: boolean;
}

export const useAuthGuard = ({
  redirectTo = '/dashboard',
  requireAuth = false,
  redirectIfAuthenticated = false,
  enableRedirect = true,
}: UseAuthGuardOptions = {}) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !enableRedirect) return;

    if (requireAuth && !user) {
      router.replace('/sign-in');
      return;
    }

    if (redirectIfAuthenticated && user) {
      router.replace(redirectTo);
      return;
    }
  }, [user, isLoaded, router, redirectTo, requireAuth, redirectIfAuthenticated, enableRedirect]);

  return {
    user,
    loading: !isLoaded,
    isAuthenticated: !!user,
  };
}; 