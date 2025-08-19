import { createServiceClient } from '@/utils/supabase/server';

export const isAdminUser = (args: { userId: string; dbRole?: string; clerkRole?: string }) => {
  const { userId, dbRole, clerkRole } = args;
  const envAdmins = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (envAdmins.includes(userId)) return true;
  if (dbRole === 'admin') return true;
  if (clerkRole === 'admin') return true;
  return false;
};

export const getIsAdminByUserId = async (userId: string): Promise<boolean> => {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from('users').select('role').eq('id', userId).single();
    const envAdmins = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim());
    return data?.role === 'admin' || envAdmins.includes(userId);
  } catch {
    const envAdmins = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim());
    return envAdmins.includes(userId);
  }
}; 