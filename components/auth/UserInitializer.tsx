"use client";

import { useUserInitialization } from '@/lib/hooks/use-user-initialization';

export const UserInitializer = () => {
  // This hook will automatically initialize users in the database
  useUserInitialization();
  
  // This component doesn't render anything - it's just for the side effect
  return null;
}; 