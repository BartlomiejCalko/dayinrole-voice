"use client";

import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="relative w-full bg-background overflow-hidden min-h-[calc(100vh-3.5rem)] flex items-center justify-center"
      aria-label="About DayInRole"
    >
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center md:py-32 rounded-2xl p-8 md:p-12 border border-border backdrop-blur-xs">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          What is DayInRole?
        </h2>
        <p className="mt-6 text-gray-500 dark:text-gray-300 leading-relaxed md:text-xl max-w-4xl">
          DayInRole helps you understand what a typical day at a specific role could look like —
          based on a real job posting. Paste a job description, and we generate a realistic day-in-the-role
          scenario: common tasks you might handle, the challenges you could face, and the context that
          matters in that environment.
        </p>
        <p className="p-2 mt-4 leading-relaxed md:text-xl text-gray-500 dark:text-gray-300 max-w-4xl">
          For each challenge, DayInRole provides actionable guidance: how to approach the problem,
          what good solutions look like, and where to find the most relevant documentation or learning resources.
          You can also generate tailored interview questions with sample answers that reflect what recruiters
          typically expect for that role and seniority.
        </p>
      </div>
      <BackgroundBeams />
    </section>
  );
};

export { About }; 