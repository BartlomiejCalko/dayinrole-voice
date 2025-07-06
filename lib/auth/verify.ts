import { auth, currentUser } from '@clerk/nextjs/server';

export interface AuthUser {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const verifyAuth = async (): Promise<AuthUser> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required - no user ID found');
    }

    const user = await currentUser();
    
    if (!user) {
      throw new Error('Authentication required - user not found');
    }

    return {
      uid: userId,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    };
  } catch (error) {
    console.error('Authentication verification failed:', error);
    throw new Error('Authentication failed');
  }
}; 