"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useUserInitialization = () => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const subscriptionSyncAttempted = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    const initializeUser = async () => {
      try {
        console.log('Checking if user exists in database:', user.id);
        
        // Check if user exists first
        const statusResponse = await fetch('/api/auth/check-user-status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.data?.status?.existsInDatabase) {
            console.log('User already exists in database');
            return;
          }
        }
        
        console.log('User not found, initializing in database:', user.id);
        
        const response = await fetch('/api/auth/initialize-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('User initialized successfully:', result.data);
          
          // 🚨 TEMPORARILY DISABLED AUTO-SYNC - it was overriding manual updates
          // Also sync subscription from Clerk metadata as backup
          // setTimeout(async () => {
          //   try {
          //     console.log('Syncing subscription from Clerk as backup');
          //     const syncResponse = await fetch('/api/subscription/manual-sync', {
          //       method: 'POST',
          //       headers: {
          //         'Content-Type': 'application/json',
          //       },
          //     });
          //     const syncResult = await syncResponse.json();
          //     if (syncResult.success) {
          //       console.log('Subscription synced from Clerk metadata');
          //     }
          //   } catch (error) {
          //     console.log('Subscription sync failed (this is normal if webhook worked):', error);
          //   }
          // }, 2000);
          
        } else {
          console.error('Failed to initialize user:', result.error);
        }
      } catch (error) {
        console.error('Error during user initialization:', error);
      }
    };
    
    // Initialize user with subscription sync as backup
    initializeUser();
    
  }, [isLoaded, isSignedIn, user]);
  
  return {
    isLoaded,
    isSignedIn,
    user
  };
}; 