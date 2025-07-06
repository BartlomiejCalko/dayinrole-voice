"use client";

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Calendar, BarChart3, Target, Zap } from 'lucide-react';

interface UsageTrackerProps {
  userId: string;
}

export const UsageTracker = ({ userId }: UsageTrackerProps) => {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/subscription/usage');
        
        if (!response.ok) {
          throw new Error('Failed to fetch usage information');
        }
        
        const data = await response.json();
        setLimits(data.limits);
      } catch (error) {
        console.error('Error fetching usage limits:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [userId]);

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-12 translate-x-12" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold">Usage This Month</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!limits || (limits.dayInRoleLimit === 0 && limits.interviewLimit === 0)) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Usage Limits Available</h3>
              <p className="text-muted-foreground">
                Subscribe to a plan to start using Day in Role features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dayInRolePercent = limits.dayInRoleLimit > 0 ? (limits.dayInRoleUsed / limits.dayInRoleLimit) * 100 : 0;
  const interviewPercent = limits.interviewLimit > 0 ? (limits.interviewsUsed / limits.interviewLimit) * 100 : 0;

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (canGenerate: boolean, percent: number) => {
    if (!canGenerate) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Limit Reached
        </Badge>
      );
    }
    if (percent >= 80) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800 text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Near Limit
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800 text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold">Usage This Month</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Resets Monthly
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Day in Role Usage */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="font-semibold text-lg">Day in Role Sessions</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(limits.canGenerateDayInRole, dayInRolePercent)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {limits.dayInRoleUsed}<span className="text-muted-foreground">/{limits.dayInRoleLimit}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {limits.dayInRoleLimit - limits.dayInRoleUsed} remaining
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={dayInRolePercent} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(dayInRolePercent)}% used</span>
              <span className="font-medium">
                {limits.dayInRoleLimit - limits.dayInRoleUsed > 0 
                  ? `${limits.dayInRoleLimit - limits.dayInRoleUsed} sessions left` 
                  : 'No sessions remaining'}
              </span>
            </div>
          </div>
        </div>

        {/* Interview Usage */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="font-semibold text-lg">Interviews</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(limits.canGenerateInterview, interviewPercent)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {limits.interviewsUsed}<span className="text-muted-foreground">/{limits.interviewLimit}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {limits.interviewLimit - limits.interviewsUsed} remaining
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={interviewPercent} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(interviewPercent)}% used</span>
              <span className="font-medium">
                {limits.interviewLimit - limits.interviewsUsed > 0 
                  ? `${limits.interviewLimit - limits.interviewsUsed} interviews left` 
                  : 'No interviews remaining'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <div className="font-medium text-purple-800 dark:text-purple-200">
                Interview Quality Limit
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Up to {limits.questionsPerInterview} questions per interview session
              </div>
            </div>
          </div>
        </div>

        {/* Warning when approaching limits */}
        {(dayInRolePercent >= 80 || interviewPercent >= 80) && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Approaching Limit:</strong> You're near your plan limits. Consider upgrading to continue without restrictions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 