import { cookies } from 'next/headers';
import { auth } from '@/firebase/admin';

export interface AuthUser {
  uid: string;
  email: string | null;
  name?: string | null;
}

export const verifyAuth = async (): Promise<AuthUser> => {
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}; 