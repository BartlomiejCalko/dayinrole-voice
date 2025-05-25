"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/shared/icons";
import { ModeToggle } from "@/components/shared/mode-toggle";

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
    name: "Pricing",
    path: "/pricing",
    public: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const isAuthenticated = !!user;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
        <div className="container flex h-14 max-w-screen-xl items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">dayinrole</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    // bg-background/95    supports-[backdrop-filter]:bg-background/60
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">dayinrole</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => {
              if (!route.public && !isAuthenticated) return null;
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
            })}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback>
                      {user?.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button asChild size="sm" className="">
                <Link href="/sign-in">
                  Try Free
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 