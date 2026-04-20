"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Sparkles, Calendar, Briefcase } from "lucide-react";

const mockTasks = [
  {
    time: "09:00",
    text: "Morning standup — review open PRs for the Payments redesign",
    tag: "Meeting",
  },
  {
    time: "10:00",
    text: "Deep work: implement new checkout flow with React and TypeScript",
    tag: "Engineering",
  },
  {
    time: "14:00",
    text: "Cross-team sync with Backend: align on new API contract for subscriptions",
    tag: "Sync",
  },
];

export const Hero = () => {
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-60" />

      {/* Radial violet glow at top center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -5%, rgba(124,58,237,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.063 0 0))",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pt-20 pb-4">
        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] text-xs text-neutral-400 hover:text-neutral-200 hover:border-white/[0.18] transition-all duration-200"
            aria-label="View interview preparation feature"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden="true" />
            Now with AI interview preparation
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        >
          Know your future job
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            before day one
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg text-neutral-500 max-w-xl leading-relaxed mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
        >
          Paste any job posting — get a realistic preview of your daily routine,
          challenges, and what your first week will actually look like.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
        >
          <Button
            asChild
            size="lg"
            className="rounded-lg px-6 h-11 font-medium bg-white text-black hover:bg-white/90 w-full sm:w-auto"
          >
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-in"}
              aria-label="Get started for free"
            >
              Get started free
              <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="rounded-lg px-6 h-11 font-medium text-neutral-400 hover:text-white border border-white/[0.10] hover:border-white/[0.20] hover:bg-white/[0.04] w-full sm:w-auto"
          >
            <Link href="/subscription" aria-label="View pricing plans">
              View pricing
            </Link>
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-neutral-600 border-t border-white/[0.06] pt-7 mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold tabular-nums">30 sec</span>
            <span>average generation</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/[0.08]" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold tabular-nums">10,000+</span>
            <span>roles analyzed</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/[0.08]" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
            <span>AI-powered insights</span>
          </div>
        </motion.div>
      </div>

      {/* Product preview — mock browser window */}
      <motion.div
        className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-24"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
      >
        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/60">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
            <div className="flex gap-1.5" aria-hidden="true">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md border border-white/[0.06] bg-white/[0.03] text-xs text-neutral-600 font-mono">
                dayinrole.net/dayinrole/preview
              </div>
            </div>
          </div>

          {/* Card content */}
          <div className="p-5">
            <div className="flex items-start gap-4 mb-5">
              {/* Company logo placeholder */}
              <div
                className="w-11 h-11 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-xs font-bold text-violet-300 tracking-tight">ST</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">Senior Frontend Engineer</h3>
                <p className="text-neutral-500 text-xs mt-0.5">at Stripe · San Francisco, CA</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <span>Apr 15, 2026</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">
                  Day in Role
                </span>
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {mockTasks.map((item, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-neutral-700 font-mono w-11 flex-shrink-0 pt-2.5 tabular-nums">
                    {item.time}
                  </span>
                  <div className="flex-1 flex items-start gap-2 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-neutral-300 flex-1 leading-relaxed">{item.text}</p>
                    <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] text-neutral-600 bg-white/[0.04] border border-white/[0.06]">
                      {item.tag}
                    </span>
                  </div>
                </div>
              ))}

              {/* Faded "more tasks" row */}
              <div className="flex gap-3 text-xs opacity-30">
                <span className="text-neutral-700 font-mono w-11 flex-shrink-0 pt-2.5">···</span>
                <div className="flex-1 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-neutral-500 italic">
                    3 more tasks · 2 challenges · 4 interview questions generated
                  </p>
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
              <div className="flex items-center gap-3 text-xs text-neutral-600">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" aria-hidden="true" />
                  6 challenges identified
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-xs text-neutral-300 hover:bg-white/[0.08] transition-colors cursor-pointer">
                View full report →
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
