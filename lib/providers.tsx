"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}; 