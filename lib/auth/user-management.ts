import { createServiceClient } from '@/utils/supabase/server';
import { AuthUser } from './verify';

export interface DatabaseUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Creates or updates a user in the database using upsert to handle race conditions
 */
export const upsertUser = async (userData: {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  display_name: string | null;
}): Promise<DatabaseUser> => {
  try {
    const supabase = createServiceClient();
    
    // Use upsert to handle race conditions gracefully
    const { data, error } = await supabase
      .from('users')
      .upsert({
        ...userData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting user:', error);
      throw new Error(`Failed to upsert user: ${error.message}`);
    }
    
    console.log('User upserted successfully:', data.id);
    return data;
    
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
};

/**
 * Ensures a user exists in the users table. Creates the user if they don't exist.
 * This should be called before creating any records that reference user_id.
 */
export const ensureUserExists = async (authUser: AuthUser): Promise<DatabaseUser> => {
  try {
    const supabase = createServiceClient();
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.uid)
      .single();
    
    if (existingUser && !fetchError) {
      return existingUser;
    }
    
    // User doesn't exist, create them using upsert
    const userData = {
      id: authUser.uid,
      first_name: authUser.firstName || null,
      last_name: authUser.lastName || null,
      email: authUser.email || '',
      display_name: authUser.firstName && authUser.lastName 
        ? `${authUser.firstName} ${authUser.lastName}`.trim()
        : authUser.firstName || authUser.lastName || null,
    };
    
    return await upsertUser(userData);
    
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
};

/**
 * Updates user information in the database
 */
export const updateUser = async (userId: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser> => {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Gets a user from the database
 */
export const getUserById = async (userId: string): Promise<DatabaseUser | null> => {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Initializes a user in the database with subscription when they first sign in
 * This is a fallback for cases where the webhook doesn't trigger
 */
export const initializeUser = async (clerkUser: any): Promise<{ user: DatabaseUser, subscription: any }> => {
  try {
    const supabase = createServiceClient();
    
    // Use upsert to handle race conditions
    const userData = {
      id: clerkUser.id,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress || '',
      display_name: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
        : clerkUser.firstName || clerkUser.lastName || null,
    };
    
    const user = await upsertUser(userData);
    console.log('User initialized in database:', user.id);
    
    // Check if user has a subscription
    const { data: existingSubscription, error: subFetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    let subscription;
    
    if (existingSubscription && !subFetchError) {
      subscription = existingSubscription;
      console.log('User already has subscription:', subscription.id);
    } else {
      // Create free subscription using upsert to handle race conditions
      const freeSubscription = {
        user_id: user.id,
        plan_id: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        cancel_at_period_end: false,
      };
      
      const { data: newSubscription, error: subInsertError } = await supabase
        .from('subscriptions')
        .upsert(freeSubscription, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (subInsertError) {
        console.error('Error creating free subscription:', subInsertError);
        // Don't fail the entire process if subscription creation fails
        subscription = null;
      } else {
        subscription = newSubscription;
        console.log('Free subscription created for user:', user.id);
      }
    }
    
    return { user, subscription };
    
  } catch (error) {
    console.error('Error initializing user:', error);
    throw error;
  }
};

/**
 * Deletes a user from the database along with all related data
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const supabase = createServiceClient();
    
    // Delete user's subscriptions first (due to foreign key constraints)
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (subscriptionError) {
      console.error('Error deleting user subscriptions:', subscriptionError);
      // Continue with user deletion even if subscription deletion fails
    } else {
      console.log('User subscriptions deleted successfully:', userId);
    }
    
    // Delete user's interviews (if they exist)
    const { error: interviewError } = await supabase
      .from('interviews')
      .delete()
      .eq('user_id', userId);
    
    if (interviewError) {
      console.error('Error deleting user interviews:', interviewError);
      // Continue with user deletion even if interview deletion fails
    } else {
      console.log('User interviews deleted successfully:', userId);
    }
    
    // Delete the user
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (userError) {
      console.error('Error deleting user:', userError);
      throw new Error(`Failed to delete user: ${userError.message}`);
    }
    
    console.log('User deleted successfully:', userId);
    
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}; 