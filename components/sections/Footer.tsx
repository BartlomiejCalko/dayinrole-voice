"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

const footerLinks = {
  navigation: [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Dashboard", href: "/dashboard" }
  ],
  legal: [
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" }
  ]
};

export const Footer = () => {
  return (
    <footer className="w-full bg-background dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800">
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="md:col-span-1"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-xl">Day in Role</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Understand what your next job will really be like. Get detailed day-in-role insights for any position.
            </p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Contact Links */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Legal & Contact</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="flex justify-between border-t border-gray-200 dark:border-neutral-800 mt-12 pt-8 text-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            © {new Date().getFullYear()} Day in Role. All rights reserved.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Made with ❤️ for job seekers
          </p>
        </motion.div>
      </div>
    </footer>
  );
}; 