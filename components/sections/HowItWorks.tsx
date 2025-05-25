"use client";

import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Timeline } from "@/components/ui/timeline";
import { 
  FileText, 
  Cpu, 
  CheckCircle 
} from "lucide-react";

const timelineData = [
  {
    title: "Step 01",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Paste Job Description
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Simply copy and paste any job posting or description into our platform. No formatting required.
            </p>
          </div>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-5/6"></div>
            <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-2/3"></div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Job description content preview
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Step 02",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              AI Analysis
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Our advanced AI analyzes the role, industry standards, and real-world data to understand the position.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-200"></div>
            <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
              AI Processing...
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              ✓ Analyzing job requirements
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              ✓ Matching industry standards
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              ✓ Processing real-world data
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Step 03",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Get Your Day-in-Role
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Receive a detailed breakdown of daily tasks, challenges, and what to expect in your new role.
            </p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Daily Schedule Generated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Key Responsibilities Identified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Challenges & Expectations Outlined
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white dark:bg-neutral-900 rounded border">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Your personalized day-in-role report is ready!
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export const HowItWorks = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background dark:bg-neutral-950">
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4"
            variants={itemVariants}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="max-w-[700px] mx-auto text-gray-500 md:text-xl dark:text-gray-400"
            variants={itemVariants}
          >
            Get insights into your potential role in just three simple steps.
          </motion.p>
        </motion.div>

        <Timeline data={timelineData} />

        <motion.div
          className="text-center mt-16"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The entire process takes less than 30 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}; 