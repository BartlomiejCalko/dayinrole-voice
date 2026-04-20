"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/", public: true },
  { name: "Pricing", path: "/subscription", public: true },
  { name: "Dashboard", path: "/dashboard", public: false },
];

const mobileLinks = [
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/subscription" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Create Day-in-Role", path: "/dayinrole/create" },
  { name: "Usage & Limits", path: "/dashboard/usage" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleMobile = () => setMobileOpen((prev) => !prev);
  const handleCloseMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between mx-auto px-4 md:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo1.svg"
            alt="dayinrole"
            width={196}
            height={101}
            className="h-4 w-auto opacity-80"
          />
          <span className="text-sm font-semibold text-white tracking-tight">dayinrole</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main Navigation">
          {navLinks.map((route) => {
            if (!route.public) {
              return (
                <SignedIn key={route.path}>
                  <Link
                    href={route.path}
                    aria-label={route.name}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm transition-colors duration-150",
                      pathname === route.path
                        ? "text-white bg-white/[0.06]"
                        : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                    )}
                  >
                    {route.name}
                  </Link>
                </SignedIn>
              );
            }
            return (
              <Link
                key={route.path}
                href={route.path}
                aria-label={route.name}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors duration-150",
                  pathname === route.path
                    ? "text-white bg-white/[0.06]"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                )}
              >
                {route.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            onClick={handleToggleMobile}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            tabIndex={0}
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>

          <div className="hidden md:flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="h-8 px-4 text-sm rounded-md font-medium bg-white text-black hover:bg-white/90"
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { avatarBox: "h-7 w-7" } }}
              />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-white/[0.06] bg-[#080808]"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col gap-0.5 p-3" aria-label="Mobile Navigation">
            <SignedOut>
              {navLinks
                .filter((r) => r.public)
                .map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={handleCloseMobile}
                    className={cn(
                      "px-3 py-2.5 rounded-md text-sm transition-colors",
                      pathname === route.path
                        ? "text-white bg-white/[0.06]"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                    tabIndex={0}
                    aria-label={route.name}
                  >
                    {route.name}
                  </Link>
                ))}
            </SignedOut>
            <SignedIn>
              {mobileLinks.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={handleCloseMobile}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm transition-colors",
                    pathname === route.path
                      ? "text-white bg-white/[0.06]"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                  tabIndex={0}
                  aria-label={route.name}
                >
                  {route.name}
                </Link>
              ))}
            </SignedIn>
          </nav>

          <div className="px-3 pb-3">
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-sm border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                    onClick={handleCloseMobile}
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="flex-1 text-sm bg-white text-black hover:bg-white/90"
                    onClick={handleCloseMobile}
                  >
                    Get started
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { avatarBox: "h-7 w-7" } }}
              />
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
};
