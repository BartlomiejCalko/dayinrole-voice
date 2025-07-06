"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';

interface SubscriptionManagementProps {
  subscription: UserSubscription | null;
  onSubscriptionUpdate: () => void;
}

export const SubscriptionManagement = ({ 
  subscription, 
  onSubscriptionUpdate 
}: SubscriptionManagementProps) => {
  const [canceling, setCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Czy na pewno chcesz anulować subskrypcję? Będziesz mieć dostęp do funkcji do końca obecnego okresu rozliczeniowego.'
    );

    if (!confirmed) return;

    setCanceling(true);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Nie udało się anulować subskrypcji');
      }

      const result = await response.json();
      toast.success(result.message || 'Subskrypcja została anulowana');
      onSubscriptionUpdate();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd podczas anulowania subskrypcji');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusBadge = (status: string, cancel_at_period_end: boolean | null) => {
    if (cancel_at_period_end) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Anulowanie</Badge>;
    }

    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktywna</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Zaległa płatność</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Anulowana</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">Nieopłacona</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string, cancel_at_period_end: boolean | null) => {
    if (cancel_at_period_end) {
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }

    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'past_due':
      case 'unpaid':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return SUBSCRIPTION_PLANS.find(plan => plan.id === subscription.plan_id);
  };

  if (!subscription) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nie masz aktywnej subskrypcji. Wybierz plan poniżej, aby rozpocząć korzystanie z Day in Role.
        </AlertDescription>
      </Alert>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Moja subskrypcja</span>
          </CardTitle>
          {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Plan Info */}
        <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
          {getStatusIcon(subscription.status, subscription.cancel_at_period_end)}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {currentPlan?.name || 'Nieznany plan'}
            </h3>
            <p className="text-muted-foreground">
              {currentPlan?.price} zł/miesiąc
            </p>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Początek okresu:</span>
            </div>
            <p className="text-muted-foreground ml-6">
              {formatDate(subscription.current_period_start)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Koniec okresu:</span>
            </div>
            <p className="text-muted-foreground ml-6">
              {formatDate(subscription.current_period_end)}
            </p>
          </div>
        </div>

        {/* Plan Features */}
        {currentPlan && (
          <div className="space-y-3">
            <h4 className="font-medium">Twój plan obejmuje:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{currentPlan.dayInRoleLimit} Day in Role miesięcznie</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{currentPlan.interviewLimit} interview na Day in Role</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Maksymalnie {currentPlan.questionsPerInterview} pytań na interview</span>
              </li>
            </ul>
          </div>
        )}

        {/* Cancellation Warning */}
        {subscription.cancel_at_period_end && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Twoja subskrypcja zostanie anulowana dnia {formatDate(subscription.current_period_end)}. 
              Do tego czasu nadal masz dostęp do wszystkich funkcji.
            </AlertDescription>
          </Alert>
        )}

        {/* Past Due Warning */}
        {subscription.status === 'past_due' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Twoja subskrypcja ma zaległą płatność. Zaktualizuj metodę płatności, aby kontynuować korzystanie z usługi.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {subscription.status === 'active' && !subscription.cancel_at_period_end && (
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="flex items-center space-x-2"
            >
              {canceling ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Anulowanie...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Anuluj subskrypcję</span>
                </>
              )}
            </Button>
          )}

          <Button variant="outline" asChild>
            <a href="mailto:support@dayinrole.com" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Kontakt z pomocą</span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 