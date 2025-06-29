"use server";

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Get current authenticated user
export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

// Require authentication - redirect to sign-in if not authenticated
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
}

// Check if user is authenticated
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

// Get authenticated user ID
export async function getAuthUserId() {
  const { userId } = await auth();
  return userId;
}

// Get authenticated user data with error handling
export async function getAuthUser() {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}