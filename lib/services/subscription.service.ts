import { createServiceClient } from '@/utils/supabase/server';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  user_id: string;
  plan_id: string;
  status?: 'active' | 'canceled' | 'past_due';
}

export class SubscriptionService {
  private supabase = createServiceClient();

  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const subscriptionData = {
      user_id: data.user_id,
      plan_id: data.plan_id,
      status: data.status || 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      cancel_at_period_end: false,
    };

    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return subscription;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data || null;
  }

  async updateSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data;
  }

  async createFreeSubscription(userId: string): Promise<Subscription> {
    return this.createSubscription({
      user_id: userId,
      plan_id: 'free',
      status: 'active',
    });
  }
}

export const subscriptionService = new SubscriptionService(); 