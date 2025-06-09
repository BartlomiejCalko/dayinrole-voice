"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Target
} from "lucide-react";

interface FeedbackData {
  id: string;
  interviewId: string;
  feedback: {
    totalScore: number;
    categoryScores: Array<{
      name: string;
      score: number;
      comment: string;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
  };
  completedAt: string;
  transcript: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
}

interface InterviewData {
  id: string;
  role: string;
  companyName?: string;
  type: string;
  level: string;
  questions: string[];
  techstack: string[];
}

const InterviewFeedbackPage = () => {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!params.id || !user) return;

      try {
        // Fetch the latest feedback for this interview
        const response = await fetch(`/api/interviews/${params.id}/feedback?userId=${user.uid}`);
        const result = await response.json();

        if (result.success) {
          setFeedback(result.data.feedback);
          setInterview(result.data.interview);
        } else {
          console.error('Failed to fetch feedback:', result.message);
          router.push(`/interview/${params.id}`);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        router.push(`/interview/${params.id}`);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      fetchFeedback();
    }
  }, [params.id, user, router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4" />;
    if (score >= 60) return <Target className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
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

  // Don't render anything if user is not authenticated or data not found
  if (!user || !feedback || !interview) {
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
                <Link href={`/interview/${params.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Interview
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                Interview <span className="text-gray-400">Feedback</span>
              </h1>
              <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                {interview.companyName ? 
                  `Results for ${interview.role} at ${interview.companyName}` :
                  `Results for ${interview.role} interview`
                }
              </p>
            </div>
          </div>
        </section>

        {/* Overall Score */}
        <section className="flex flex-col px-6">
          <div className="max-w-4xl mx-auto w-full">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <CardTitle>Overall Performance</CardTitle>
                </div>
                <div className="space-y-4">
                  <div className={`text-6xl font-bold ${getScoreColor(feedback.feedback.totalScore)}`}>
                    {feedback.feedback.totalScore}%
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {getScoreIcon(feedback.feedback.totalScore)}
                    <span className="text-lg font-medium">
                      {feedback.feedback.totalScore >= 80 ? "Excellent" :
                       feedback.feedback.totalScore >= 60 ? "Good" : "Needs Improvement"}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Category Scores */}
        <section className="flex flex-col px-6">
          <div className="max-w-4xl mx-auto w-full">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {feedback.feedback.categoryScores.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{category.name}</h4>
                      <div className={`flex items-center gap-2 ${getScoreColor(category.score)}`}>
                        {getScoreIcon(category.score)}
                        <span className="font-semibold">{category.score}%</span>
                      </div>
                    </div>
                    <Progress value={category.score} className="h-2" />
                    <p className="text-sm text-muted-foreground">{category.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Strengths and Areas for Improvement */}
        <section className="flex flex-col px-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-5 h-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.feedback.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final Assessment */}
        <section className="flex flex-col px-6">
          <div className="max-w-4xl mx-auto w-full">
            <Card>
              <CardHeader>
                <CardTitle>Final Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feedback.feedback.finalAssessment}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col px-6 pb-12">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href={`/interview/${interview.id}?start=true`}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Interview
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>

              {interview.techstack.length > 0 && (
                <Button asChild variant="outline" size="lg">
                  <Link href="/dayinrole/create">
                    Practice More Roles
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InterviewFeedbackPage; 