import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionTier, SubscriptionStatus } from '@/lib/subscription';
import { invokeFunction } from '@/lib/supabase-function-client';

interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
  cancelSubscription: () => Promise<boolean>;
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

  // Admin override: jagawins@gmail.com → Pro (build-trigger-v2)
  // Deduplication: prevent multiple simultaneous calls
  const checkInFlightRef = useRef(false);
  const lastCheckRef = useRef(0);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setSubscription(defaultSubscription);
      return;
    }

    // Skip if already checking or checked within last 5 seconds
    const now = Date.now();
    if (checkInFlightRef.current || (now - lastCheckRef.current) < 5000) {
      return;
    }
    checkInFlightRef.current = true;
    lastCheckRef.current = now;

    setLoading(true);
    try {
      const response = await invokeFunction<{
        subscribed?: boolean;
        tier?: string;
        product_id?: string;
        subscription_end?: string;
      }>('check-subscription', undefined, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        console.error('[SUBSCRIPTION] Error:', response.error, 'Status:', response.status);
        // Admin override even on error
        const ADMIN_EMAILS_ERR = ["jag@axiva.ai", "jag@verityaxis.com", "jagawins@gmail.com"];
        if (user?.email && ADMIN_EMAILS_ERR.includes(user.email)) {
          console.log('[SUBSCRIPTION] Admin override on error for', user.email);
          setSubscription({ subscribed: true, tier: 'pro', productId: 'admin_override', subscriptionEnd: null });
          return;
        }
        setSubscription(defaultSubscription);
        return;
      }

      const data = response.data;
      console.log('[SUBSCRIPTION] Response:', JSON.stringify(data));

      // Client-side admin override — safety net if edge function isn't deployed
      const ADMIN_EMAILS = ["jag@axiva.ai", "jag@verityaxis.com", "jagawins@gmail.com"];
      const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
      if (isAdmin && data?.tier === 'free') {
        console.log('[SUBSCRIPTION] Admin override — granting Pro tier for', user.email);
        setSubscription({
          subscribed: true,
          tier: 'pro',
          productId: 'admin_override',
          subscriptionEnd: null,
        });
        return;
      }

      setSubscription({
        subscribed: data?.subscribed || false,
        tier: (data?.tier as SubscriptionTier) || 'free',
        productId: data?.product_id || null,
        subscriptionEnd: data?.subscription_end || null,
      });
    } catch (error) {
      console.error('[SUBSCRIPTION] Catch error:', error);
      // Admin override even on exception
      const ADMIN_EMAILS_CATCH = ["jag@axiva.ai", "jag@verityaxis.com", "jagawins@gmail.com"];
      if (user?.email && ADMIN_EMAILS_CATCH.includes(user.email)) {
        console.log('[SUBSCRIPTION] Admin override on catch for', user.email);
        setSubscription({ subscribed: true, tier: 'pro', productId: 'admin_override', subscriptionEnd: null });
        return;
      }
      setSubscription(defaultSubscription);
    } finally {
      setLoading(false);
      checkInFlightRef.current = false;
    }
  }, [session?.access_token]);

  const createCheckout = async (priceId: string): Promise<string | null> => {
    if (!session?.access_token) {
      console.error('No session available for checkout');
      return null;
    }

    try {
      const response = await invokeFunction<{ url?: string }>('create-checkout', { priceId }, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        console.error('Error creating checkout:', response.error);
        return null;
      }

      return response.data?.url || null;
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
      const response = await invokeFunction<{ url?: string }>('customer-portal', undefined, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        console.error('Error opening customer portal:', response.error);
        return null;
      }

      return response.data?.url || null;
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
