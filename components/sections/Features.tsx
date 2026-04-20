"use client";

import { motion } from "framer-motion";
import { Zap, Target, Clock, Shield, Users, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant analysis",
    description:
      "Paste a job description and get a complete day-in-role breakdown within seconds. No forms, no waiting.",
  },
  {
    icon: Target,
    title: "Accurate predictions",
    description:
      "AI-powered analysis trained on thousands of real job postings and industry patterns across roles and levels.",
  },
  {
    icon: Clock,
    title: "Save hours of research",
    description:
      "Skip the Glassdoor rabbit holes. Get straight to understanding what your day-to-day would actually look like.",
  },
  {
    icon: Shield,
    title: "Reliable insights",
    description:
      "Grounded in the actual job posting — not generic advice. Every output reflects what the specific company wrote.",
  },
  {
    icon: Users,
    title: "Real scenarios",
    description:
      "Understand the meetings you'll sit in, the stakeholders you'll manage, and the pressure points of the role.",
  },
  {
    icon: Layers,
    title: "Interview preparation",
    description:
      "Generate tailored interview questions with sample answers that reflect what recruiters actually expect for this role.",
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="relative w-full py-20 md:py-28"
      aria-label="Features"
    >
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          className="max-w-2xl mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.12] mb-4">
            Everything you need to
            <br />
            evaluate any role
          </h2>
          <p className="text-neutral-500 text-base leading-relaxed">
            From a realistic daily schedule to interview preparation — all from a single job posting.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.05]">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                className="bg-[#080808] p-6 md:p-7 hover:bg-white/[0.02] transition-colors duration-200 group"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
              >
                <div className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mb-5 group-hover:border-white/[0.14] transition-colors duration-200">
                  <Icon
                    className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors duration-200"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-white font-semibold text-sm mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
