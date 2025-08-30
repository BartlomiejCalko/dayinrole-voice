"use client";

import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Target, 
  Clock, 
  Shield, 
  Users
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get detailed day-in-role insights within seconds of pasting any job description.",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
  },
  {
    icon: Target,
    title: "Accurate Predictions",
    description: "AI-powered analysis based on real industry data and job market trends.",
    iconColor: "text-red-600 dark:text-red-400",
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]"
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Skip hours of research and get straight to understanding your potential role.",
    iconColor: "text-blue-600 dark:text-blue-400",
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/9/3/13]"
  },
  {
    icon: Shield,
    title: "Reliable Insights",
    description: "Trusted by job seekers for making informed career decisions.",
    iconColor: "text-green-600 dark:text-green-400",
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:2/1/3/5]"
  },
  {
    icon: Users,
    title: "Real Scenarios",
    description: "Understand actual daily tasks, challenges, and responsibilities you'll face.",
    iconColor: "text-purple-600 dark:text-purple-400",
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/5/3/9]"
  }
];

interface FeatureItemProps {
  area: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconColor: string;
}

const FeatureItem = ({ area, icon: Icon, title, description, iconColor }: FeatureItemProps) => {
  return (
    <motion.li 
      className={cn("min-h-[14rem] list-none", area)}
      variants={itemVariants}
    >
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background/80 backdrop-blur-sm p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-3">
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
};

export const Features = () => {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 bg-background dark:bg-neutral-950 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-blue-500/10 to-green-500/10 blur-3xl" />
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Why Choose Day in Role?
          </motion.h2>
          <motion.p 
            className="max-w-[700px] mx-auto md:text-xl text-gray-500 dark:text-gray-300"
            variants={itemVariants}
          >
            Discover what makes our platform the go-to solution for understanding your next career move.
          </motion.p>
        </motion.div>

        <motion.ul
          className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-4 lg:gap-4 xl:max-h-[40rem] xl:grid-rows-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              area={feature.area}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
            />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}; 