"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "How it works", href: "/#how-it-works" },
    { name: "Pricing", href: "/subscription" },
    { name: "Dashboard", href: "/dashboard" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-and-conditions" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Contact", href: "/contact" },
  ],
};

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#080808]" role="contentinfo">
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4" aria-label="dayinrole home">
              <Image
                src="/logo1.svg"
                alt="dayinrole logo"
                width={196}
                height={101}
                className="h-4 w-auto opacity-70"
              />
              <span className="text-sm font-semibold text-white tracking-tight">dayinrole</span>
            </Link>
            <p className="text-neutral-600 text-sm leading-relaxed max-w-xs">
              Understand what your next job will really be like — before you accept the offer.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-2.5 list-none" role="list">
              {footerLinks.product.map((link) => (
                <li key={link.name} className="list-none">
                  <Link
                    href={link.href}
                    className="text-neutral-600 text-sm hover:text-white transition-colors duration-150"
                    aria-label={link.name}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 list-none" role="list">
              {footerLinks.legal.map((link) => (
                <li key={link.name} className="list-none">
                  <Link
                    href={link.href}
                    className="text-neutral-600 text-sm hover:text-white transition-colors duration-150"
                    aria-label={link.name}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="list-none">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
                  className="text-neutral-600 text-sm hover:text-white transition-colors duration-150 focus:outline-none focus-visible:underline"
                  aria-label="Open cookie settings"
                >
                  Cookie settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-white/[0.06]">
          <p className="text-neutral-700 text-xs">
            © {new Date().getFullYear()} Day in Role. All rights reserved.
          </p>
          <p className="text-neutral-700 text-xs">
            Built for job seekers who want clarity, not surprises.
          </p>
        </div>
      </div>
    </footer>
  );
};
