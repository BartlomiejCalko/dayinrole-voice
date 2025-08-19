"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn } from "@/lib/utils";
import { Home, Layers, MessageSquare, CreditCard, HelpCircle, BarChart3, Settings } from "lucide-react";

const routes = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Create Day‑in‑Role", href: "/dayinrole/create", icon: Layers },
  { name: "Interviews", href: "/interview", icon: MessageSquare },
  { name: "Usage & Limits", href: "/dashboard/usage", icon: BarChart3 },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  
];

const LeftSidebar = () => {
  const pathname = usePathname();
  const [plan, setPlan] = useState<string>("free");
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/subscription/status");
        if (!res.ok) return;
        const data = await res.json();
        setPlan(data.subscription?.plan_id || "free");
        setLimits(data.limits || null);
      } catch {}
    };
    fetchStatus();
  }, []);

  return (
    <aside className="hidden md:flex sticky left-0 top-14 w-64 flex-shrink-0 flex-col justify-between overflow-hidden border-r bg-background/60 p-4 h-screen">
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Plan</div>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">{plan}</Badge>
            {limits && (
              <span className="text-xs text-muted-foreground">
                {limits.dayInRoleUsed}/{limits.dayInRoleLimit} DiR · {limits.interviewsUsed}/{limits.interviewLimit} Int
              </span>
            )}
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-1" aria-label="Sidebar Navigation">
          {routes.map((r) => {
            const Icon = r.icon;
            const active = pathname === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-label={r.name}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{r.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <ModeToggle />
        <Button asChild variant="outline" size="sm">
          <Link href="/subscription">Upgrade</Link>
        </Button>
      </div>
    </aside>
  );
};

export default LeftSidebar; 