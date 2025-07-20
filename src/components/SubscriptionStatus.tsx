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
      case 'trial': return 'bg-primary text-primary-foreground';
      case 'active': return 'bg-green-500 text-white';
      case 'past_due': return 'bg-yellow-500 text-black';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'expired': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
        <CreditCard className="h-4 w-4" />
        <div className="animate-pulse">
          <div className="h-3 bg-muted-foreground/20 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-destructive/20 text-destructive rounded-md">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">No subscription</span>
      </div>
    );
  }

  const isTrialEnding = subscription.status === 'trial' && subscription.days_remaining <= 30;
  const isExpired = subscription.days_remaining <= 0 && (subscription.status === 'trial' || subscription.status === 'expired');

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-card border rounded-md">
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <Badge className={getStatusColor(subscription.status)} variant="outline">
        {getStatusText(subscription.status)}
      </Badge>
      {subscription.days_remaining > 0 ? (
        <span className="text-sm text-muted-foreground">
          {subscription.days_remaining}d left
        </span>
      ) : (
        <AlertTriangle className="h-4 w-4 text-destructive" />
      )}
      {(subscription.status === 'trial' || subscription.days_remaining <= 0) && (
        <Button size="sm" variant="outline" onClick={handleUpgrade} className="text-xs px-2 py-1 h-6">
          Upgrade
        </Button>
      )}
    </div>
  );
}