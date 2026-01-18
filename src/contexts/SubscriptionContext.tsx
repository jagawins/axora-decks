import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionTier, SubscriptionStatus, SUBSCRIPTION_TIERS } from '@/lib/subscription';

interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
}

const defaultSubscription: SubscriptionStatus = {
  subscribed: false,
  tier: 'free',
  productId: null,
  subscriptionEnd: null,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>(defaultSubscription);
  const [loading, setLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setSubscription(defaultSubscription);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription(defaultSubscription);
        return;
      }

      setSubscription({
        subscribed: data.subscribed || false,
        tier: (data.tier as SubscriptionTier) || 'free',
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(defaultSubscription);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const createCheckout = async (priceId: string): Promise<string | null> => {
    if (!session?.access_token) {
      console.error('No session available for checkout');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        return null;
      }

      return data.url || null;
    } catch (error) {
      console.error('Error creating checkout:', error);
      return null;
    }
  };

  const openCustomerPortal = async (): Promise<string | null> => {
    if (!session?.access_token) {
      console.error('No session available for customer portal');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        return null;
      }

      return data.url || null;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      return null;
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscription(defaultSubscription);
    }
  }, [user, checkSubscription]);

  // Auto-refresh subscription every 60 seconds when logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const value = {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
