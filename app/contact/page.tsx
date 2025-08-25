"use client";

import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/sections/Footer";
import { ContactSection } from "@/components/sections/Contact";

const ContactPage = () => {

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage; 