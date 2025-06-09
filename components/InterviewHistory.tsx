"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  RotateCcw, 
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface InterviewWithAttempt {
  id: string;
  role: string;
  type: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  questionCount: number;
  completedAttempts: number;
  latestAttempt?: {
    id: string;
    completedAt: string;
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
  };
}

interface InterviewHistoryProps {
  dayInRoleId: string;
  userId: string;
}

const InterviewHistory = ({ dayInRoleId, userId }: InterviewHistoryProps) => {
  const [interviews, setInterviews] = useState<InterviewWithAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/dayinrole/${dayInRoleId}/interviews?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
          setInterviews(result.data || []);
        } else {
          setError(result.message || 'Failed to fetch interviews');
          console.error('Failed to fetch interviews:', result.message);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (dayInRoleId && userId) {
      fetchInterviews();
    }
  }, [dayInRoleId, userId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 mb-2">Failed to load interviews</p>
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No interviews created yet</p>
            <p className="text-sm text-muted-foreground">
              Generate your first interview to start practicing!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Interview History ({interviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div 
              key={interview.id} 
              className="border border-border/20 rounded-lg p-6 bg-card/50 hover:bg-card/70 transition-colors"
            >
              {/* Interview Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {interview.questionCount || 0} Question Interview
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {interview.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {interview.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {dayjs(interview.createdAt).fromNow()}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {interview.completedAttempts || 0} completed
                    </div>
                  </div>
                </div>
                
                {/* Latest Score */}
                {interview.latestAttempt && interview.latestAttempt.feedback && (
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Latest Score</span>
                    </div>
                    <Badge 
                      variant={getScoreBadgeVariant(interview.latestAttempt.feedback.totalScore || 0)}
                      className="text-sm font-bold"
                    >
                      {interview.latestAttempt.feedback.totalScore || 0}/100
                    </Badge>
                  </div>
                )}
              </div>

              {/* Latest Attempt Info */}
              {interview.latestAttempt && interview.latestAttempt.feedback && (
                <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">Latest Performance</h4>
                    <span className="text-xs text-muted-foreground">
                      {dayjs(interview.latestAttempt.completedAt).fromNow()}
                    </span>
                  </div>
                  
                  {/* Category Scores */}
                  <div className="space-y-2">
                    {(interview.latestAttempt.feedback.categoryScores || []).slice(0, 3).map((category, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={category?.score || 0} 
                            className="w-16 h-2" 
                          />
                          <span className={`font-medium ${getScoreColor(category?.score || 0)}`}>
                            {category?.score || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                    {(interview.latestAttempt.feedback.strengths || []).length > 0 && (
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          💪 Key Strength:
                        </span>
                                                  <p className="text-muted-foreground mt-1 overflow-hidden text-ellipsis max-h-8">
                            {interview.latestAttempt.feedback.strengths[0] || 'No strengths available'}
                        </p>
                      </div>
                    )}
                    {(interview.latestAttempt.feedback.areasForImprovement || []).length > 0 && (
                      <div>
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          🎯 Focus Area:
                        </span>
                                                  <p className="text-muted-foreground mt-1 overflow-hidden text-ellipsis max-h-8">
                            {interview.latestAttempt.feedback.areasForImprovement[0] || 'No focus areas available'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1 mb-4">
                {(interview.techstack || []).slice(0, 4).map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {(interview.techstack || []).length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{(interview.techstack || []).length - 4}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button asChild size="sm">
                  <Link href={`/interview/${interview.id}?start=true`}>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {(interview.completedAttempts || 0) > 0 ? 'Retake' : 'Start'}
                  </Link>
                </Button>
                
                {interview.latestAttempt && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/interview/${interview.id}/feedback`}>
                      <Eye className="w-3 h-3 mr-1" />
                      View Feedback
                    </Link>
                  </Button>
                )}

                {(interview.completedAttempts || 0) === 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <AlertCircle className="w-3 h-3" />
                    Not started yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewHistory; 