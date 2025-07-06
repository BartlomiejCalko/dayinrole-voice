"use client";

import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { 
  Brain, 
  DollarSign, 
  Calendar, 
  Award 
} from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Make Informed Decisions",
    description: "Understand exactly what you're signing up for before accepting any job offer.",
    stat: "95%",
    statLabel: "Better job satisfaction"
  },
  {
    icon: DollarSign,
    title: "Negotiate Better",
    description: "Know the real scope of work to negotiate fair compensation and benefits.",
    stat: "23%",
    statLabel: "Higher salary offers"
  },
  {
    icon: Calendar,
    title: "Prepare Effectively",
    description: "Start your new role with confidence knowing what to expect from day one.",
    stat: "87%",
    statLabel: "Faster onboarding"
  },
  {
    icon: Award,
    title: "Career Growth",
    description: "Choose roles that align with your career goals and skill development plans.",
    stat: "76%",
    statLabel: "Career advancement"
  }
];

export const Benefits = () => {
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-neutral-900">
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
            Transform Your Job Search
          </motion.h2>
          <motion.p 
            className="max-w-[700px] mx-auto text-gray-500 md:text-xl dark:text-gray-400"
            variants={itemVariants}
          >
            Join thousands of professionals who make smarter career decisions with Day in Role.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="flex items-start space-x-4 p-6 rounded-lg bg-background dark:bg-neutral-950 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  {benefit.description}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary">{benefit.stat}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{benefit.statLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Know Your Day in Role?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-[600px] mx-auto">
              Stop guessing what your new job will be like. Get detailed insights and make confident career decisions today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href={isAuthenticated ? "/dashboard" : "/sign-in"}>
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                <Link href="/subscription">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 