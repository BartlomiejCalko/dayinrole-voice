"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn } from "@/lib/utils";
import { Home, Layers, MessageSquare, CreditCard, HelpCircle, ChevronLeft, ChevronRight, BarChart3, Settings } from "lucide-react";

type DashboardSidebarProps = {
  leftOffset?: number;
};

const routes = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Create Day-in-Role", href: "/dayinrole/create", icon: Layers },
  { name: "Interviews", href: "/interview", icon: MessageSquare },
  { name: "Usage & Limits", href: "/dashboard/usage", icon: BarChart3 },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  
];

export const DashboardSidebar = ({ leftOffset = 0 }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<string>("free");
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);

  const handleToggle = () => setOpen((o) => !o);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "[" || e.key.toLowerCase() === "s") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "Escape") setOpen(false);
  };

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

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-3">
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
      <nav className="mt-2 flex-1 space-y-1 px-2" aria-label="Sidebar Navigation">
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
      <div className="border-t px-3 py-3">
        <div className="flex items-center justify-between">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            aria-label="Toggle sidebar"
            aria-controls="dashboard-sidebar"
            aria-expanded={open}
            className="md:hidden"
          >
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        id="dashboard-sidebar"
        className="hidden md:block md:h-[calc(100vh-56px)] md:w-64 md:shrink-0 md:border-r md:bg-background/60 md:z-40"
        style={{ position: "fixed", top: 56, left: leftOffset }}
        aria-label="Dashboard sidebar"
      >
        {SidebarInner}
      </aside>

      {/* Mobile off-canvas */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-label="Open sidebar"
          aria-controls="dashboard-sidebar-drawer"
          aria-expanded={open}
          className="m-3"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div
              id="dashboard-sidebar-drawer"
              className="absolute left-0 top-0 h-full w-72 bg-background p-2 shadow-2xl"
            >
              {SidebarInner}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardSidebar; 