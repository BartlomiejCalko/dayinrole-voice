"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { testimonials } from "@/lib/testimonials-data";
import { useUser } from "@clerk/nextjs";

// interface HeroProps {
//   isAuthenticated: boolean;
// }

// ({ isAuthenticated }: HeroProps)

export function Hero(){
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background dark:bg-neutral-950">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            className="flex flex-col space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                {/* Be familiar with<br />Your <span className="text-gray-400">new</span> Job */}
                Know &lsquo;Day in role&rsquo;<br />In Your <span className="text-gray-400">new</span> Job
              </h1>
              <p className="max-w-[500px] text-gray-500 md:text-xl dark:text-gray-400 mt-6">
                Paste any job posting URL or text &ndash; get a realistic &lsquo;day in the life&rsquo; summary instantly. Typical challenges and daily tasks.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href={isAuthenticated ? "/dashboard" : "/sign-in"}>
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Testimonials |||||  bg-background/30 dark:bg-neutral-950/30  */}
          <motion.div 
            className="relative w-full h-full rounded-3xl "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative bg-dot-pattern h-full w-full">
              {/* bg-background/80 dark:bg-neutral-950/80 */}
              <div className="absolute inset-0 backdrop-blur-sm"></div> 
              <div className="relative z-10 p-6">
                <div className="mb-8">
                  <h3 className="text-lg font-medium"></h3>
                </div>
                <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 