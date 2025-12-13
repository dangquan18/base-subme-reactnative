import { useState, useEffect } from "react";
import { subscriptionService } from "@/services/subscription.service";
import { Subscription } from "@/types";

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getUserSubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (id: string) => {
    try {
      await subscriptionService.cancelSubscription(id);
      await fetchSubscriptions(); // Refresh list
    } catch (err) {
      console.error("Error canceling subscription:", err);
      throw err;
    }
  };

  const pauseSubscription = async (id: string) => {
    try {
      await subscriptionService.pauseSubscription(id);
      await fetchSubscriptions(); // Refresh list
    } catch (err) {
      console.error("Error pausing subscription:", err);
      throw err;
    }
  };

  const resumeSubscription = async (id: string) => {
    try {
      await subscriptionService.resumeSubscription(id);
      await fetchSubscriptions(); // Refresh list
    } catch (err) {
      console.error("Error resuming subscription:", err);
      throw err;
    }
  };

  const renewSubscription = async (id: string) => {
    try {
      await subscriptionService.renewSubscription(id);
      await fetchSubscriptions(); // Refresh list
    } catch (err) {
      console.error("Error renewing subscription:", err);
      throw err;
    }
  };

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
  };
};

export const useSubscriptionDetail = (id: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchSubscriptionDetail();
    }
  }, [id]);

  const fetchSubscriptionDetail = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getSubscriptionById(id);
      setSubscription(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching subscription detail:", err);
    } finally {
      setLoading(false);
    }
  };

  return { subscription, loading, error, refetch: fetchSubscriptionDetail };
};
