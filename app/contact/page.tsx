"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/sections/Footer";
import Link from "next/link";
import React from "react";
import { useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { HighlightGroup, HighlighterItem, Particles } from "@/components/ui/highlighter";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Icons } from "@/components/shared/icons";

const ContactPage = () => {
  const email = "support@dayinrole.app";
  const [scope, animate] = useAnimate();

  React.useEffect(() => {
    animate(
      [
        ["#pointer", { left: 200, top: 60 }, { duration: 0 }],
        ["#javascript", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 50, top: 102 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#javascript", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#react-js", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 224, top: 170 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#react-js", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#typescript", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 88, top: 198 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#typescript", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#next-js", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 200, top: 60 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#next-js", { opacity: 0.5 }, { at: "-0.3", duration: 0.1 }],
      ],
      {
        repeat: Number.POSITIVE_INFINITY,
      },
    );
  }, [animate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="relative container mx-auto max-w-5xl px-4 md:px-6 py-10">
          <HighlightGroup className="group h-full">
            <div className="group/item h-full" data-aos="fade-down">
              <HighlighterItem className="rounded-3xl p-6">
                <div className="relative z-20 h-full overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-black">
                  <Particles
                    className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                    quantity={200}
                    color={"#555555"}
                    vy={-0.2}
                  />

                  <div className="flex justify-center">
                    <div className="flex h-full flex-col justify-center gap-10 p-4 md:h-[300px] md:flex-row">
                      <div
                        className="relative mx-auto h-[270px] w-[300px] md:h-[270px] md:w-[300px]"
                        ref={scope}
                      >
                        <Icons.logo className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2" />
                        <div
                          id="next-js"
                          className="absolute bottom-12 left-14 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          UI-UX
                        </div>
                        <div
                          id="react-js"
                          className="absolute left-2 top-20 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Graphic Design
                        </div>
                        <div
                          id="typescript"
                          className="absolute bottom-20 right-1 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Web Application
                        </div>
                        <div
                          id="javascript"
                          className="absolute right-12 top-10 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Branding
                        </div>

                        <div id="pointer" className="absolute">
                          <svg
                            width="16.8"
                            height="18.2"
                            viewBox="0 0 12 13"
                            className="fill-red-500"
                            stroke="white"
                            strokeWidth="1"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 5.50676L0 0L2.83818 13L6.30623 7.86537L12 5.50676V5.50676Z"
                            />
                          </svg>
                          <span className="relative -top-1 left-3 rounded-3xl bg-primary px-2 py-1 text-xs text-primary-foreground">
                            Day in Role
                          </span>
                        </div>
                      </div>

                      <div className="-mt-20 flex h-full flex-col justify-center p-2 md:-mt-4 md:ml-10 md:w-[400px]">
                        <div className="flex flex-col items-center md:items-start">
                          <h1 className="mt-6 pb-1 font-bold">
                            <span className="text-2xl md:text-4xl">Any questions about Day in Role?</span>
                          </h1>
                        </div>
                        <p className="mb-4 text-slate-500 dark:text-slate-400">
                          Feel free to reach out to us!
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">
                            <Button aria-label="Email support">Email support</Button>
                          </Link>
                          <Link
                            href={`mailto:${email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              }),
                            )}
                            aria-label="Send email"
                          >
                            <span className="flex items-center gap-1">
                              <Mail strokeWidth={1} className="h-5 w-5" />
                            </span>
                          </Link>
                          <Link
                            href="/contact"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              }),
                            )}
                            aria-label="Request a call"
                          >
                            <span className="flex items-center gap-1">
                              <Phone strokeWidth={1} className="h-5 w-5" />
                            </span>
                          </Link>
                          <Link
                            href="/contact"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              }),
                            )}
                            aria-label="Send a message"
                          >
                            <span className="flex items-center gap-1">
                              <MessageCircle strokeWidth={1} className="h-5 w-5" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </HighlighterItem>
            </div>
          </HighlightGroup>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage; 