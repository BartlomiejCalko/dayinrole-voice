"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "30s", label: "To generate a full Day-in-Role" },
  { value: "100%", label: "Based on real job postings" },
  { value: "3 steps", label: "Paste · Analyze · Review" },
];

export const About = () => {
  return (
    <section className="relative w-full border-y border-white/[0.06] bg-white/[0.015]">
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4">
              What is DayInRole
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.12] mb-5">
              Stop guessing what your
              <br />
              new job is actually like
            </h2>
            <p className="text-neutral-500 leading-relaxed text-base">
              DayInRole analyzes any job posting and generates a realistic picture of what your
              working day would look like — the meetings, the tasks, the problems to solve,
              and the challenges you&apos;ll face. No fluff, no guesswork.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm mt-4">
              For each challenge, you also get actionable guidance: how to approach it, what good
              looks like, and relevant documentation. Plus tailored interview questions with
              sample answers to help you prepare.
            </p>
          </motion.div>

          {/* Right — stats */}
          <motion.div
            className="flex flex-col gap-0"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-6 py-5 border-t border-white/[0.06] first:border-t-0 last:border-b last:border-white/[0.06]"
              >
                <span className="text-3xl font-bold text-white tracking-tight tabular-nums w-24 shrink-0">
                  {stat.value}
                </span>
                <span className="text-neutral-500 text-sm leading-relaxed">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
