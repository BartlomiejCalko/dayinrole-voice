"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

const outcomes = [
  {
    stat: "95%",
    label: "Better job fit decisions",
    description: "Users report feeling significantly more confident about accepting a role after reviewing their Day-in-Role.",
  },
  {
    stat: "23%",
    label: "Higher salary negotiation",
    description: "Knowing the real scope of work helps you negotiate fair compensation from an informed position.",
  },
  {
    stat: "87%",
    label: "Faster onboarding",
    description: "Starting a role knowing what to expect means less ramp-up time and fewer unpleasant surprises.",
  },
  {
    stat: "3×",
    label: "Interview confidence",
    description: "Walk into interviews with role-specific questions and answers already prepared, not generic advice.",
  },
];

export const Benefits = () => {
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <section
      className="relative w-full py-20 md:py-28 border-t border-white/[0.06]"
      aria-label="Outcomes and benefits"
    >
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4">
            Why it matters
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.12] mb-4">
            Make smarter career
            <br />
            decisions, not lucky ones
          </h2>
          <p className="text-neutral-500 text-base leading-relaxed">
            Job seekers who understand a role before accepting it perform better, stay longer,
            and negotiate from a stronger position.
          </p>
        </motion.div>

        {/* Outcomes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.05] mb-16">
          {outcomes.map((item, i) => (
            <motion.div
              key={i}
              className="bg-[#080808] p-6 md:p-7 hover:bg-white/[0.02] transition-colors duration-200"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            >
              <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
                {item.stat}
              </div>
              <div className="text-sm font-medium text-neutral-300 mb-3">{item.label}</div>
              <p className="text-neutral-600 text-xs leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA box */}
        <motion.div
          className="relative rounded-xl border border-white/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-10 md:px-12 md:py-12">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
                Ready to know your day in role?
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Stop guessing. Paste a job description and get your personalized preview in under 30 seconds.
                Free to try.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Button
                asChild
                size="lg"
                className="rounded-lg px-6 h-11 font-medium bg-white text-black hover:bg-white/90 w-full sm:w-auto"
              >
                <Link
                  href={isAuthenticated ? "/dayinrole/create" : "/sign-in"}
                  aria-label="Create your first Day-in-Role"
                >
                  Create Day-in-Role
                  <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-lg px-6 h-11 font-medium text-neutral-400 hover:text-white border border-white/[0.10] hover:border-white/[0.20] hover:bg-white/[0.04] w-full sm:w-auto"
              >
                <Link href="/subscription" aria-label="View pricing">
                  View pricing
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
