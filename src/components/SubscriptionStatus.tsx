import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionInfo {
  subscription_id: string;
  status: string;
  plan_name: string;
  trial_end: string | null;
  current_period_end: string | null;
  days_remaining: number;
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.station_id) {
      fetchSubscriptionStatus();
    }
  }, [user, profile]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_subscription_status', { station_id_param: profile?.station_id });

      if (error) throw error;

      if (data && data.length > 0) {
        setSubscription(data[0]);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'past_due': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trial': return 'Free Trial';
      case 'active': return 'Active';
      case 'past_due': return 'Past Due';
      case 'cancelled': return 'Cancelled';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const handleUpgrade = () => {
    // TODO: Implement Stripe checkout
    toast({
      title: "Coming Soon",
      description: "Subscription upgrade will be available soon",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No subscription information found. Please contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isTrialEnding = subscription.status === 'trial' && subscription.days_remaining <= 30;
  const isExpired = subscription.days_remaining <= 0 && (subscription.status === 'trial' || subscription.status === 'expired');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusText(subscription.status)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Current plan: {subscription.plan_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trial/Subscription Info */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {subscription.status === 'trial' ? (
            <span>
              Trial ends: {subscription.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : 'Unknown'}
            </span>
          ) : (
            <span>
              Next billing: {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'Unknown'}
            </span>
          )}
        </div>

        {/* Days Remaining */}
        <div className="flex items-center gap-2">
          {subscription.days_remaining > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            {subscription.days_remaining > 0 
              ? `${subscription.days_remaining} days remaining`
              : 'Subscription has expired'
            }
          </span>
        </div>

        {/* Alerts */}
        {isExpired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your subscription has expired. Please upgrade to continue using the platform.
            </AlertDescription>
          </Alert>
        )}

        {isTrialEnding && !isExpired && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your trial ends in {subscription.days_remaining} days. Upgrade now to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {(subscription.status === 'trial' || isExpired) && (
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade to Paid Plan
          </Button>
        )}

        {subscription.status === 'active' && (
          <Button variant="outline" onClick={handleUpgrade} className="w-full">
            Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}