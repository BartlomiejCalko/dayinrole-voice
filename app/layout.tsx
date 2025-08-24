import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/lib/providers";
import { ClerkProvider } from "@clerk/nextjs";
import CookieConsent from "@/components/CookieConsent";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Day In Role",
  description: "An AI powered assistant for analyzing job offers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${monaSans.className} antialiased`}
        >
          <Providers>
            {children}
            {/* Cookie consent runs client-side globally */}
            <CookieConsent />
          </Providers>

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
