"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DayInRoleForm from "@/components/DayInRoleForm";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Lock, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CreateDayInRolePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<{
    isFreePlan: boolean;
    planId: string;
    limits: SubscriptionLimits;
  } | null>(null);
  const router = useRouter();
  const { user, loading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  // Check user subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setUserSubscription({
          isFreePlan: !data.subscription || data.subscription.plan_id === 'free',
          planId: data.subscription?.plan_id || 'free',
          limits: data.limits || {
            dayInRoleLimit: 0,
            dayInRoleUsed: 0,
            interviewLimit: 0,
            interviewsUsed: 0,
            questionsPerInterview: 3,
            canGenerateDayInRole: false,
            canGenerateInterview: false
          }
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Default to free plan on error
      setUserSubscription({
        isFreePlan: true,
        planId: 'free',
        limits: {
          dayInRoleLimit: 0,
          dayInRoleUsed: 0,
          interviewLimit: 0,
          interviewsUsed: 0,
          questionsPerInterview: 3,
          canGenerateDayInRole: false,
          canGenerateInterview: false
        }
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const handleSubmit = async (input: string, language: 'original' | 'english', inputType: 'text' | 'url') => {
    if (!user || !user.id) {
      console.error('User not authenticated or missing user ID:', { user: !!user, userId: user?.id });
      toast.error('User not authenticated');
      return;
    }

    // Check if user can generate Day-in-Role
    if (userSubscription?.isFreePlan) {
      toast.error('Free plan users can only view examples. Please upgrade to create your own Day-in-Role experiences.');
      return;
    }

    if (!input || !input.trim()) {
      console.error('Input is empty or whitespace-only');
      toast.error('Please provide job offer text or URL');
      return;
    }

    console.log('Form submitted with:', { 
      language, 
      inputType, 
      userId: user.id,
      inputLength: input.trim().length 
    }); // Debug log

    setIsLoading(true);
    try {
      const requestBody = {
        jobOfferText: input,
        userId: user.id,
        language,
        inputType,
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
        
        if (result.requiresUpgrade) {
          toast.error(result.message);
        } else {
          toast.error(result.message || 'Failed to generate day in role');
        }
      }
    } catch (error) {
      console.error('Error creating day in role:', error);
      toast.error('Error creating day in role');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading || !userSubscription) {
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

  // If user is on free plan, show upgrade prompt
  if (userSubscription.isFreePlan) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-neutral-950">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Free Plan Restriction Card */}
            <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10 max-w-2xl mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl md:text-3xl mb-2">
                  Upgrade to Create Day-in-Role Experiences
                </CardTitle>
                <CardDescription className="text-base">
                  You&apos;re currently on the Free plan. To create personalized Day-in-Role experiences, please upgrade to a paid plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    What you get with a paid plan:
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Generate personalized Day-in-Role experiences
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Create custom interview questions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Save and manage your experiences
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Unlimited access to sample content
                    </li>
                  </ul>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Meanwhile, you can explore our example Day-in-Role experiences to see what&apos;s possible.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Link href="/subscription">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard">
                        <Sparkles className="h-4 w-4 mr-2" />
                        View Examples
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Preview */}
            <div className="mt-12 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Preview: What You Could Create
              </h2>
              <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-semibold text-sm">Personalized Tasks</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get specific daily tasks based on your target role
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">💡</div>
                    <h3 className="font-semibold text-sm">Smart Insights</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Understand challenges and get helpful tips
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🚀</div>
                    <h3 className="font-semibold text-sm">Interview Prep</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate custom interview questions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-neutral-950">
      {/* Background gradient */}
      <div className="inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Create Your Day in Role Experience
            </h1>
            {/* <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform any job offer into an immersive preview of your potential workday. 
              Simply paste a job posting URL or text to discover the daily tasks, challenges, and culture before you apply.
            </p> */}
          </div>
          
          <DayInRoleForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              💡 Try pasting a job posting URL from LinkedIn, Indeed, Glassdoor, or any job board for instant extraction!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDayInRolePage; 