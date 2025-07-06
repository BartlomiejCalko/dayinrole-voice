"use client";

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export const useUserInitialization = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const initializationAttempted = useRef(false);
  
  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !isSignedIn || !user || initializationAttempted.current) {
        return;
      }
      
      try {
        initializationAttempted.current = true;
        
        console.log('Initializing user in database:', user.id);
        
        const response = await fetch('/api/auth/initialize-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('User initialized successfully:', result.data.user.id);
        } else {
          console.error('Failed to initialize user:', result.error);
        }
      } catch (error) {
        console.error('Error during user initialization:', error);
      }
    };
    
    initializeUser();
  }, [isLoaded, isSignedIn, user]);
  
  return {
    isLoaded,
    isSignedIn,
    user
  };
}; 