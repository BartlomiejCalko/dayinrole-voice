"use client";

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

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
          throw new Error('Nie udało się pobrać informacji o wykorzystaniu');
        }
        
        const data = await response.json();
        setLimits(data.limits);
      } catch (error) {
        console.error('Error fetching usage limits:', error);
        setError(error instanceof Error ? error.message : 'Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Wykorzystanie subskrypcji</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
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
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Brak aktywnej subskrypcji. Wykup plan, aby rozpocząć korzystanie z Day in Role.
        </AlertDescription>
      </Alert>
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
      return <Badge variant="destructive">Limit wyczerpany</Badge>;
    }
    if (percent >= 80) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Blisko limitu</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Dostępne</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Wykorzystanie w tym miesiącu</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Odnawia się co miesiąc
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Day in Role Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Day in Role</span>
              {getStatusBadge(limits.canGenerateDayInRole, dayInRolePercent)}
            </div>
            <span className="text-sm text-muted-foreground">
              {limits.dayInRoleUsed}/{limits.dayInRoleLimit}
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={dayInRolePercent} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(dayInRolePercent)}% wykorzystane</span>
              <span>{limits.dayInRoleLimit - limits.dayInRoleUsed} pozostało</span>
            </div>
          </div>
        </div>

        {/* Interview Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Wywiady</span>
              {getStatusBadge(limits.canGenerateInterview, interviewPercent)}
            </div>
            <span className="text-sm text-muted-foreground">
              {limits.interviewsUsed}/{limits.interviewLimit}
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={interviewPercent} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(interviewPercent)}% wykorzystane</span>
              <span>{limits.interviewLimit - limits.interviewsUsed} pozostało</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Maksymalnie {limits.questionsPerInterview} pytań na wywiad</span>
          </div>
        </div>

        {/* Warning when approaching limits */}
        {(dayInRolePercent >= 80 || interviewPercent >= 80) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Zbliżasz się do limitu swojego planu. Rozważ przejście na wyższy plan, aby kontynuować bez ograniczeń.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 