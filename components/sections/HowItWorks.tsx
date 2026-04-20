"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Paste the job description",
    description:
      "Copy any job posting — from LinkedIn, company career pages, or anywhere else — and paste it directly. No formatting required.",
    detail: "Supports job URLs and raw text",
  },
  {
    number: "02",
    title: "AI analyzes the role",
    description:
      "Our model processes the posting against industry patterns, role expectations, and real-world data to map out a typical workday.",
    detail: "Takes less than 30 seconds",
  },
  {
    number: "03",
    title: "Review your Day-in-Role",
    description:
      "Get a structured breakdown of daily tasks, recurring challenges, stakeholder interactions, and what good performance looks like in this role.",
    detail: "Includes interview prep questions",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="relative w-full py-20 md:py-28 border-t border-white/[0.06]"
      aria-label="How it works"
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
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.12] mb-4">
            From job posting to clarity
            <br />
            in three steps
          </h2>
          <p className="text-neutral-500 text-base leading-relaxed">
            The entire process takes under a minute. No account setup friction, no learning curve.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-white/[0.06]">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-5 py-8 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0 border-t border-white/[0.06] md:border-t-0 first:border-t-0"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
            >
              {/* Step number */}
              <span
                className="text-[4rem] font-bold leading-none tracking-tighter text-white/[0.06] select-none"
                aria-hidden="true"
              >
                {step.number}
              </span>

              <div className="space-y-3">
                <h3 className="text-white font-semibold text-base tracking-tight">
                  {step.title}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Detail tag */}
              <div className="mt-auto pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-700">
                  <span
                    className="h-1 w-1 rounded-full bg-violet-500"
                    aria-hidden="true"
                  />
                  {step.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
