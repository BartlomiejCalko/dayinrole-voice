"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, Target, Briefcase, CheckCircle, RotateCcw } from "lucide-react";

interface InterviewData {
  id: string;
  role: string;
  type: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  dayInRoleId?: string;
  companyName?: string;
  questionCount: number;
  completedAttempts: number;
}

interface TranscriptEntry {
  timestamp: string;
  speaker: 'user' | 'ai';
  message: string;
}

const InterviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dayInRoleLanguage, setDayInRoleLanguage] = useState<'original' | 'english' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user, loading: authLoading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  // Check if we should start immediately (when coming from Start button)
  const shouldStartImmediately = searchParams.get('start') === 'true';

  useEffect(() => {
    const fetchInterview = async () => {
      if (!params.id || !user) return;

      try {
        const response = await fetch(`/api/interviews/${params.id}?userId=${user.uid}`);
        const result = await response.json();

        if (result.success) {
          setInterview(result.data);
          
          // Start interview immediately if requested
          if (shouldStartImmediately) {
            setIsStarted(true);
          }
          
          // Fetch dayinrole language if dayInRoleId exists
          if (result.data.dayInRoleId) {
            try {
              const dayInRoleResponse = await fetch(`/api/dayinrole/${result.data.dayInRoleId}?userId=${user.uid}`);
              const dayInRoleResult = await dayInRoleResponse.json();
              
              if (dayInRoleResult.success && dayInRoleResult.data.language) {
                setDayInRoleLanguage(dayInRoleResult.data.language);
              }
            } catch (error) {
              console.error('Error fetching dayinrole language:', error);
              // Continue with default language if fetch fails
            }
          }
        } else {
          console.error('Failed to fetch interview:', result.message);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching interview:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      fetchInterview();
    }
  }, [params.id, user, router, shouldStartImmediately]);

  // TODO: Will be used by Gemini Agent
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleInterviewComplete = async (transcript: TranscriptEntry[]) => {
    if (!interview || !user) return;

    try {
      // Save the interview attempt and generate feedback
      const response = await fetch('/api/interviews/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interview.id,
          userId: user.uid,
          transcript,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsCompleted(true);
        // Update completed attempts count
        setInterview(prev => prev ? { ...prev, completedAttempts: prev.completedAttempts + 1 } : null);
        
        // Redirect to feedback page after a short delay
        setTimeout(() => {
          router.push(`/interview/${interview.id}/feedback`);
        }, 2000);
      } else {
        console.error('Failed to save interview completion:', result.message);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const handleRetakeInterview = () => {
    setIsStarted(false);
    setIsCompleted(false);
  };

  // Show loading state while checking authentication
  if (authLoading || loading) {
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

  // Don't render anything if user is not authenticated or interview not found
  if (!user || !interview) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-neutral-950">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[40%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-500/10 to-green-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <section className="flex flex-col gap-6 pt-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <Button asChild variant="outline">
                <Link href="/dashboard">← Back to Dashboard</Link>
              </Button>
              {interview.dayInRoleId && (
                <Button asChild variant="outline">
                  <Link href={`/dayinrole/${interview.dayInRoleId}`}>View Day in Role</Link>
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                Interview <span className="text-gray-400">Practice</span>
              </h1>
              <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                {interview.companyName ? 
                  `Practice for the ${interview.role} position at ${interview.companyName}` :
                  `Practice interview for ${interview.role} position`
                }
              </p>
            </div>
          </div>
        </section>

        {/* Interview Info Card */}
        {!isStarted && (
          <section className="flex flex-col px-6">
            <div className="max-w-4xl mx-auto w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Interview Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Interview Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{interview.role}</div>
                        <div className="text-sm text-muted-foreground">{interview.level} Level</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{interview.questions.length} Questions</div>
                        <div className="text-sm text-muted-foreground">~{interview.questions.length * 3} minutes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{interview.completedAttempts} Attempts</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{interview.type}</Badge>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {interview.techstack.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Technologies Covered:</h4>
                      <div className="flex flex-wrap gap-2">
                        {interview.techstack.map((tech, index) => (
                          <Badge key={index} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={() => setIsStarted(true)}
                      className="flex-1"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Start Interview
                    </Button>
                    
                    {interview.completedAttempts > 0 && (
                      <Button asChild variant="outline">
                        <Link href={`/interview/${interview.id}/feedback`}>
                          View Latest Feedback
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Completion Message */}
                  {isCompleted && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Interview Completed!</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Your feedback is being generated. Redirecting to results...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Interview Session */}
        {isStarted && !isCompleted && (
          <section className="flex flex-col px-6 py-12">
            {/* TODO: Replace with Gemini Agent Component */}
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Gemini Agent Integration
                </h3>
                <p className="text-muted-foreground">
                  The Gemini-powered interview agent will be integrated here.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button onClick={handleRetakeInterview} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Interview
              </Button>
            </div>
          </section>
        )}

        {/* Completion Section */}
        {isCompleted && (
          <section className="flex flex-col px-6 py-12">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground">Interview Complete!</h2>
              <p className="text-muted-foreground">
                Great job completing the interview! Your responses are being analyzed to provide detailed feedback.
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button onClick={handleRetakeInterview} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Interview
                </Button>
                <Button asChild>
                  <Link href={`/interview/${interview.id}/feedback`}>
                    View Feedback
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default InterviewPage; 