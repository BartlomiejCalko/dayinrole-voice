import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/lib/providers";
import { ClerkProvider } from "@clerk/nextjs";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Day In Role Voice",
  description: "An AI powered voice assistant for analyzing job offer",
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
          </Providers>

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
