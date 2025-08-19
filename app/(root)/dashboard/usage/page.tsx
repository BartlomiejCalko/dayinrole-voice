"use client";

import { UsageTracker } from "@/components/subscription/UsageTracker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";

const UsagePage = () => {
  const { user } = useAuthGuard({ requireAuth: true, enableRedirect: true });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usage & Limits</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/subscription">Upgrade</Link></Button>
          <Button asChild><Link href="/dayinrole/create">Create Day‑in‑Role</Link></Button>
        </div>
      </div>
      <UsageTracker userId={user.id} />
    </div>
  );
};

export default UsagePage; 