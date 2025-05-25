"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DayInRoleForm from "@/components/DayInRoleForm";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CreateDayInRolePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  const handleSubmit = async (jobOfferText: string, language: 'original' | 'english') => {
    if (!user) return;

    console.log('Form submitted with language:', language); // Debug log

    setIsLoading(true);
    try {
      const requestBody = {
        jobOfferText,
        userId: user.uid,
        language,
      };
      
      console.log('Request body:', requestBody); // Debug log

      const response = await fetch('/api/dayinrole/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dayinrole/${result.data.id}`);
      } else {
        console.error('Failed to generate day in role:', result.message);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error creating day in role:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-neutral-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-neutral-950">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Button asChild variant="outline">
                <Link href="/dashboard">← Back to Dashboard</Link>
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Create Your Day in Role Experience
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform any job offer into an immersive preview of your potential workday. 
              Discover the daily tasks, challenges, and culture before you apply.
            </p>
          </div>
          
          <DayInRoleForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Need inspiration? Try pasting a job posting from LinkedIn, Indeed, or any job board.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDayInRolePage; 