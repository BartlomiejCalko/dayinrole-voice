"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Don't do anything while loading or if redirects are disabled
    if (loading || !enableRedirect) return;

    // Add a small delay to prevent rapid redirects
    redirectTimeoutRef.current = setTimeout(() => {
      // Only redirect if authentication is required and user is not authenticated
      if (requireAuth && !user) {
        router.replace('/sign-in');
        return;
      }

      // Only redirect authenticated users if explicitly requested
      if (redirectIfAuthenticated && user) {
        router.replace(redirectTo);
        return;
      }
    }, 100); // 100ms delay to allow auth state to stabilize

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [user, loading, router, redirectTo, requireAuth, redirectIfAuthenticated, enableRedirect]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}; 