"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import SampleInterviewQuestions from "@/components/SampleInterviewQuestions";
import Link from "next/link";

const DayInRoleDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [dayInRole, setDayInRole] = useState<DayInRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [existingQuestionSets, setExistingQuestionSets] = useState<InterviewQuestionSet[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [userSubscription, setUserSubscription] = useState<{
    isFreePlan: boolean;
    planId: string;
    limits: SubscriptionLimits;
  } | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);

  const { user, loading: authLoading } = useAuthGuard({
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

  const fetchDayInRole = async () => {
    if (!params.id) return;

    try {
      // First try to fetch from regular API
      let response = await fetch(`/api/dayinrole/${params.id}?userId=${user?.id}`);
      let result = await response.json();

      if (result.success) {
        setDayInRole(result.data);
        setIsSampleData(false);
      } else {
        // If not found in regular data, try sample data
        const sampleResponse = await fetch('/api/dayinrole/samples');
        const sampleResult = await sampleResponse.json();

        if (sampleResult.success) {
          const sampleItem = sampleResult.data.find((item: DayInRole) => item.id === params.id);
          if (sampleItem) {
            setDayInRole(sampleItem);
            setIsSampleData(true);
          } else {
            console.error('Day-in-Role not found in samples either');
          }
        } else {
          console.error('Failed to fetch day in role:', result.message);
        }
      }
    } catch (error) {
      console.error('Error fetching day in role:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingQuestions = async () => {
    if (!dayInRole || !user || isSampleData || userSubscription?.isFreePlan) return;

    setLoadingQuestions(true);
    try {
      // Fetch from interview_questions table for full question objects
      const response = await fetch(`/api/interview/questions?dayInRoleId=${dayInRole.id}&userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setExistingQuestionSets(result.data);
      } else {
        console.error('Failed to fetch existing questions:', result.message);
      }
    } catch (error) {
      console.error('Error fetching existing questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!dayInRole || !user) return;

    // Check if user can generate questions
    if (userSubscription?.isFreePlan || isSampleData) {
      toast.error('Free plan users can only view sample questions. Please upgrade to generate custom interview questions.');
      return;
    }

    setGeneratingQuestions(true);

    try {
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayInRole,
          numberOfQuestions: parseInt(numberOfQuestions),
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh existing questions list
        fetchExistingQuestions();
        
        // Navigate to interview page with question set ID
        const searchParams = new URLSearchParams({
          questionSetId: result.questionSetId,
          dayInRoleTitle: `${dayInRole.position} at ${dayInRole.companyName}`,
          dayInRoleId: dayInRole.id,
        });
        
        router.push(`/interview?${searchParams.toString()}`);
      } else {
        console.error('Failed to generate questions:', result.message);
        toast.error(result.message || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Error generating questions');
    } finally {
      setGeneratingQuestions(false);
      setDialogOpen(false);
    }
  };

  const handleOpenExistingQuestions = (questionSet: any) => {
    // Navigate to interview page with question set ID
    const searchParams = new URLSearchParams({
      questionSetId: questionSet.id,
      dayInRoleTitle: questionSet.dayInRoleTitle,
      dayInRoleId: questionSet.dayInRoleId,
    });
    
    router.push(`/interview?${searchParams.toString()}`);
  };

  useEffect(() => {
    if (params.id) {
      fetchDayInRole();
    }
  }, [params.id]);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  useEffect(() => {
    if (dayInRole && user && userSubscription) {
      fetchExistingQuestions();
    }
  }, [dayInRole, user, userSubscription]);

  // Show loading state while checking authentication
  if (authLoading || loading || !userSubscription) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background dark:bg-neutral-950">
        <div className="absolute inset-0 pointer-events-none">
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
  if (!user || !dayInRole) {
    return null;
  }

  const formattedDate = dayjs(dayInRole.createdAt).format('MMMM D, YYYY');

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 py-8">
        <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Sample Data Alert */}
            {isSampleData && (
              <div className="mb-6">
                <Card className="border-2 border-dashed border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-green-500" />
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Sample Experience
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      This is a sample Day-in-Role experience. {userSubscription?.isFreePlan ? 'Upgrade to create your own personalized experiences.' : 'You can create your own personalized experiences from your dashboard.'}
                    </p>
                    <div className="flex gap-2 justify-center">
                      {userSubscription?.isFreePlan ? (
                        <Button asChild size="sm">
                          <Link href="/subscription">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade Plan
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm">
                          <Link href="/dayinrole/create">
                            Create Your Own
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-center mb-6">
              {dayInRole.companyLogo ? (
                <div className="relative">
                  <Image 
                    src={dayInRole.companyLogo} 
                    alt={`${dayInRole.companyName} logo`} 
                    width={120} 
                    height={120} 
                    className="rounded-full object-cover size-[120px] bg-white p-3" 
                    unoptimized={true}
                    onError={(e) => {
                      // Fallback to company name if logo fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.nextElementSibling;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                        fallback.classList.add('flex');
                      }
                    }}
                  />
                  {/* Company Name Fallback (hidden by default when logo exists) */}
                  <div className="hidden size-[120px] rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 items-center justify-center">
                    <span className="text-lg font-bold text-primary leading-none">
                      {dayInRole.companyName.split(' ').map(word => word.charAt(0)).join('').slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                /* Company Name Fallback when no logo */
                <div className="flex size-[120px] rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 items-center justify-center">
                  <span className="text-lg font-bold text-primary leading-none">
                    {dayInRole.companyName.split(' ').map(word => word.charAt(0)).join('').slice(0, 3).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              {dayInRole.position}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4">
              at {dayInRole.companyName}
            </p>
            <div className="flex justify-center items-center gap-4 mb-2">
              <p className="text-sm text-muted-foreground">
                Generated on {formattedDate}
              </p>
              {dayInRole.language && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dayInRole.language === 'english' 
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                    : 'bg-green-500/20 text-green-600 dark:text-green-400'
                }`}>
                  {dayInRole.language === 'english' ? '🇺🇸 English' : '🌍 Original Language'}
                </span>
              )}
            </div>

            {/* Interview Questions Section */}
            <div className="flex flex-col items-center mt-6 space-y-6">
              {/* Existing Questions - only for paid users and non-sample data */}
              {!isSampleData && !userSubscription?.isFreePlan && !loadingQuestions && existingQuestionSets.length > 0 && (
                <div className="w-full max-w-2xl space-y-4">
                  <h3 className="text-xl font-semibold text-foreground text-center">
                    Previous Interview Questions
                  </h3>
                  <div className="grid gap-3">
                    {existingQuestionSets.map((questionSet) => (
                      <Card 
                        key={questionSet.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/30 bg-gradient-to-br from-card to-card/80 mx-1 sm:mx-0"
                        onClick={() => handleOpenExistingQuestions(questionSet)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                  <span className="text-lg">🎯</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {questionSet.numberOfQuestions} Interview Questions
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Generated {new Date(questionSet.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                questionSet.language === 'english' 
                                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                                  : 'bg-green-500/20 text-green-600 dark:text-green-400'
                              }`}>
                                {questionSet.language === 'english' ? '🇺🇸 EN' : '🌍 Original'}
                              </span>
                              <div className="text-muted-foreground">→</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate New Questions - only for paid users and non-sample data */}
              {!isSampleData && !userSubscription?.isFreePlan && !dialogOpen && (
                <Button 
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {existingQuestionSets.length > 0 ? '✨ Generate New Questions' : '🎯 Generate Interview Questions'}
                </Button>
              )}

              {/* Generate Questions Dialog */}
              {!isSampleData && !userSubscription?.isFreePlan && dialogOpen && (
                <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 mx-1 sm:mx-0">
                  <CardHeader className="px-3 sm:px-6">
                    <CardTitle className="text-center text-white text-base sm:text-lg">Generate Interview Questions</CardTitle>
                    <p className="text-center text-gray-300 text-xs sm:text-sm">
                      Create personalized interview questions based on this role to practice and improve your interview skills.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 px-3 sm:px-6">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfQuestions" className="text-white">
                        Number of Questions
                      </Label>
                      <Input
                        id="numberOfQuestions"
                        type="number"
                        min="3"
                        max="15"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="5"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleGenerateQuestions}
                        disabled={generatingQuestions}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        {generatingQuestions ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          'Generate'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>

          {/* Day Description */}
          <Card className="mb-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 shadow-lg mx-1 sm:mx-0">
            <CardHeader className="pb-4 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="p-1.5 sm:p-2 rounded-full bg-primary/20">
                  <Image src="/calendar.svg" alt="calendar" width={24} height={24} className="sm:w-[28px] sm:h-[28px]" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Your Typical Day
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <div className="bg-background/0 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-border/0">
                <div className="text-foreground leading-relaxed whitespace-pre-line break-words text-sm sm:text-base md:text-lg font-normal sm:font-medium">
                  {dayInRole.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-white">
                <Image src="/briefcase.svg" alt="challenges" width={28} height={28} />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Example Tasks & Common Challenges
              </h2>
            </div>
            
            <div className="grid gap-6">
              {dayInRole.challenges.map((challenge, index) => {
                // Handle both new structure (object) and legacy structure (string)
                const isNewStructure = typeof challenge === 'object' && challenge.challenge;
                const challengeText = isNewStructure ? challenge.challenge : String(challenge);
                const tips = isNewStructure ? challenge.tips : null;
                const resources = isNewStructure ? challenge.resources : null;
                
                // Use dedicated title field or fallback to generic title
                const taskTitle = isNewStructure && challenge.title 
                  ? challenge.title 
                  : `Task ${index + 1}`;
                const challengeDescription = challengeText;

                return (
                  <Card key={index} className="border border-border/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/30 bg-gradient-to-br from-card to-card/80 mx-1 sm:mx-0">
                    <CardHeader className="pb-4 px-3 sm:px-6">
                      <CardTitle className="flex items-center gap-3 text-base sm:text-lg md:text-xl">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-primary-foreground shadow-md">
                          {index + 1}
                        </div>
                        <span className="text-foreground">{taskTitle}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 px-3 sm:px-6">
                      {/* Challenge */}
                      <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 sm:p-4 border-l-4 border-orange-500">
                        <h4 className="text-sm sm:text-base font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                          <span className="text-base sm:text-lg">⚡</span>
                          Challenge:
                        </h4>
                        <div className="text-foreground leading-relaxed break-words whitespace-pre-line text-sm sm:text-base">
                          {challengeDescription}
                        </div>
                      </div>

                      {/* Tips & Resources */}
                      {(tips || resources) && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
                          <h4 className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                            <span className="text-base sm:text-lg">💡</span>
                            Tips & Resources
                          </h4>
                          
                          {tips && tips.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                                Quick Tips:
                              </h5>
                              <div className="space-y-2">
                                {tips.map((tip: string, tipIndex: number) => (
                                  <div key={tipIndex} className="flex items-start gap-2 sm:gap-3 bg-background/50 rounded-md p-2 sm:p-3">
                                    <span className="text-green-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
                                    <span className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {resources && resources.length > 0 && (
                            <div>
                              <h5 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></span>
                                Helpful Resources:
                              </h5>
                              <div className="space-y-2">
                                {resources.map((resource: string, resourceIndex: number) => (
                                  <div key={resourceIndex} className="flex items-start gap-2 sm:gap-3 bg-background/50 rounded-md p-2 sm:p-3">
                                    <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">📚</span>
                                    <span className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{resource}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Requirements */}
          <Card className="mb-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 shadow-lg mx-1 sm:mx-0">
            <CardHeader className="pb-4 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="p-1.5 sm:p-2 rounded-full bg-primary/20">
                  <Image src="/check.svg" alt="requirements" width={24} height={24} className="sm:w-[28px] sm:h-[28px]" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Key Requirements
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <div className="bg-background/0 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-border/0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {dayInRole.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 sm:p-3 bg-card/50 rounded-lg border border-border/30">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-foreground text-sm sm:text-base font-medium">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 shadow-lg mx-1 sm:mx-0">
            <CardHeader className="pb-4 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="p-1.5 sm:p-2 rounded-full bg-primary/20">
                  <Image src="/code.svg" alt="tech stack" width={24} height={24} className="sm:w-[28px] sm:h-[28px]" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Technology Stack
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <div className="bg-background/0 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-border/0">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {dayInRole.techstack.map((tech, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-foreground text-sm font-medium capitalize">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard">
                ← Back to Dashboard
              </Link>
            </Button>
            {!isSampleData && userSubscription?.isFreePlan && (
              <Button asChild className="w-full sm:w-auto">
                <Link href="/subscription">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Create Your Own
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sample Interview Questions - show for sample data or when requested */}
      {isSampleData && (
        <SampleInterviewQuestions 
          dayInRoleId={dayInRole.id} 
          isFreePlan={userSubscription?.isFreePlan || false}
        />
      )}
    </div>
  );
};

export default DayInRoleDetailPage; 