"use client";

import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Benefits } from "@/components/sections/Benefits";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/shared/navbar";
import { About } from "@/components/sections/About";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const HomePage = () => {
  const { isLoaded } = useUser();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border border-white/20 border-t-white/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Benefits />
      <Footer />
    </div>
  );
};

export default HomePage;
