"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { ModeToggle } from "./mode-toggle";

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
    public: false,
  },
  {
    name: "Pricing",
    path: "/pricing",
    public: true,
  },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">dayinrole</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => {
              // Show public routes to everyone
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
              
              // Show private routes only to authenticated users
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
        <div className="flex items-center space-x-4">
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
    </header>
  );
}; 