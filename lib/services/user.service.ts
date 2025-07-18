import { createServiceClient } from '@/utils/supabase/server';

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export class UserService {
  private supabase = createServiceClient();

  async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        display_name: userData.first_name && userData.last_name 
          ? `${userData.first_name} ${userData.last_name}`.trim()
          : userData.first_name || userData.last_name || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data || null;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async updateUser(id: string, updates: Partial<CreateUserData>): Promise<User> {
    const displayName = updates.first_name && updates.last_name 
      ? `${updates.first_name} ${updates.last_name}`.trim()
      : updates.first_name || updates.last_name || null;

    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...updates,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async userExists(id: string): Promise<boolean> {
    const user = await this.getUserById(id);
    return user !== null;
  }
}

export const userService = new UserService(); 