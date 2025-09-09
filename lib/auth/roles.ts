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
  // 1) Environment override
  const envAdmins = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (envAdmins.includes(userId)) return true;

  const tryIdVariants = (id: string): string[] => {
    const variants = new Set<string>([id]);
    if (id.includes('I')) variants.add(id.replace(/I/g, 'l'));
    if (id.includes('l')) variants.add(id.replace(/l/g, 'I'));
    return Array.from(variants);
  };

  // 2) Try with service role client (bypasses RLS)
  try {
    const supabaseService = createServiceClient();
    for (const variant of tryIdVariants(userId)) {
      const { data: svcData } = await supabaseService
        .from('users')
        .select('role')
        .eq('id', variant)
        .single();
      if (svcData?.role === 'admin') return true;
    }
  } catch {}

  // 3) Fallback: try with authenticated user session client (if available in this request scope)
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    for (const variant of tryIdVariants(userId)) {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', variant)
        .single();
      if (data?.role === 'admin') return true;
    }
  } catch {}

  // 4) Fallback: check Clerk user metadata for multiple shapes
  try {
    const { currentUser } = await import('@clerk/nextjs/server');
    const clerkUser = await currentUser();
    if (clerkUser?.id && tryIdVariants(userId).includes(clerkUser.id)) {
      const pm: any = clerkUser.publicMetadata || {};
      const prv: any = clerkUser.privateMetadata || {};
      const org: any = clerkUser.organizationMemberships || [];

      const rolesFromMeta = new Set<string>();
      const pushRoles = (val: any) => {
        if (!val) return;
        if (Array.isArray(val)) val.forEach((v: any) => rolesFromMeta.add(String(v)));
        else rolesFromMeta.add(String(val));
      };
      pushRoles(pm.role);
      pushRoles(prv.role);
      pushRoles(pm.roles);
      pushRoles(prv.roles);

      const isAdminMeta = pm.isAdmin === true || prv.isAdmin === true;
      const isAdminRole = rolesFromMeta.has('admin') || rolesFromMeta.has('ADMIN');
      const isAdminOrg = Array.isArray(org) && org.some((m: any) => (m?.role === 'admin' || m?.role === 'org:admin'));

      if (isAdminMeta || isAdminRole || isAdminOrg) return true;
    }
  } catch {}

  return false;
}; 