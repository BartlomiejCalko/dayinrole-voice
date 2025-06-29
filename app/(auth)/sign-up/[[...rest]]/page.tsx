"use client";

import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            card: 'bg-card/50 backdrop-blur-sm border border-border/50 shadow-2xl',
          }
        }}
      />
    </div>
  )
}