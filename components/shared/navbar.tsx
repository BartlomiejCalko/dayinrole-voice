"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const routes = [
  {
    name: "Home",
    path: "/",
    public: true,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    public: false,
  },
  {
    name: "Subscription",
    path: "/subscription",
    public: true,
  },
];

// Dashboard-only destinations (used in mobile menu when signed in)
const dashboardRoutes = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Create Day-in-Role", path: "/dayinrole/create" },
  { name: "Interviews", path: "/interview" },
  { name: "Usage & Limits", path: "/dashboard/usage" },
  { name: "Subscription", path: "/subscription" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleMobile = () => setMobileOpen((prev) => !prev);
  const handleCloseMobile = () => setMobileOpen(false);
  const handleKeyDownMobile: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Escape") setMobileOpen(false);
    if (e.key.toLowerCase() === "m") setMobileOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo1.svg" alt="Day in Role logo" width={196} height={101} className="h-4 w-auto" />
            <span className="font-bold ml-2">dayinrole</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium" aria-label="Main Navigation">
            {routes.map((route) => {
              if (route.public) {
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "transition-colors hover:text-foreground/80",
                      pathname === route.path ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {route.name}
                  </Link>
                );
              }

              return (
                <SignedIn key={route.path}>
                  <Link
                    href={route.path}
                    className={cn(
                      "transition-colors hover:text-foreground/80",
                      pathname === route.path ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {route.name}
                  </Link>
                </SignedIn>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleToggleMobile}
            onKeyDown={handleKeyDownMobile}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            tabIndex={0}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>

          {/* Theme toggle & auth - desktop always visible */}
          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />
            <SignedOut>
              <div className="flex items-center space-x-3">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">
                    Sign up
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseMobile} aria-hidden="true" />
          <div id="mobile-menu" className="absolute left-0 right-0 top-14 border-t bg-background shadow-lg">
            <div className="px-4 py-3">
              <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
                {/* Signed-out: only public routes */}
                <SignedOut>
                  {routes
                    .filter((r) => r.public)
                    .map((route) => (
                      <Link
                        key={route.path}
                        href={route.path}
                        onClick={handleCloseMobile}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-muted/60",
                          pathname === route.path ? "text-foreground bg-muted/60" : "text-foreground/80"
                        )}
                        tabIndex={0}
                        aria-label={route.name}
                      >
                        {route.name}
                      </Link>
                    ))}
                </SignedOut>

                {/* Signed-in: Home + full dashboard destinations, no duplicates */}
                <SignedIn>
                  {[{ name: "Home", path: "/" }, ...dashboardRoutes].map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={handleCloseMobile}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-muted/60",
                        pathname === route.path ? "text-foreground bg-muted/60" : "text-foreground/80"
                      )}
                      tabIndex={0}
                      aria-label={route.name}
                    >
                      {route.name}
                    </Link>
                  ))}
                </SignedIn>
              </nav>
              <div className="mt-3 flex items-center justify-between">
                <ModeToggle />
                <div>
                  <SignedOut>
                    <div className="flex items-center gap-2">
                      <SignInButton mode="modal">
                        <Button variant="outline" size="sm" onClick={handleCloseMobile}>
                          Sign in
                        </Button>
                      </SignInButton>
                      <SignInButton mode="modal">
                        <Button size="sm" onClick={handleCloseMobile}>
                          Sign up
                        </Button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: { avatarBox: "h-8 w-8" }
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}; 