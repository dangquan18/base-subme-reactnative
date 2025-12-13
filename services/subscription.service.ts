import { apiClient } from "./api";
import { Subscription, PaymentMethod } from "@/types";

interface CreateSubscriptionRequest {
  packageId: string;
  paymentMethodId: string;
  duration: "weekly" | "monthly";
  autoRenew: boolean;
}

interface UpdateSubscriptionRequest {
  autoRenew?: boolean;
  paymentMethodId?: string;
}

export const subscriptionService = {
  // Get user subscriptions
  async getUserSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await apiClient.get<Subscription[]>("/subscriptions");
      return response;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },

  // Get subscription by ID
  async getSubscriptionById(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.get<Subscription>(
        `/subscriptions/${id}`
      );
      return response;
    } catch (error) {
      console.error("Get subscription by ID error:", error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<Subscription> {
    try {
      const response = await apiClient.post<Subscription>(
        "/subscriptions",
        data
      );
      return response;
    } catch (error) {
      console.error("Create subscription error:", error);
      throw error;
    }
  },

  // Update subscription
  async updateSubscription(
    id: string,
    data: UpdateSubscriptionRequest
  ): Promise<Subscription> {
    try {
      const response = await apiClient.patch<Subscription>(
        `/subscriptions/${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error("Update subscription error:", error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(id: string): Promise<void> {
    try {
      await apiClient.delete(`/subscriptions/${id}`);
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw error;
    }
  },

  // Pause subscription
  async pauseSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.post<Subscription>(
        `/subscriptions/${id}/pause`
      );
      return response;
    } catch (error) {
      console.error("Pause subscription error:", error);
      throw error;
    }
  },

  // Resume subscription
  async resumeSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.post<Subscription>(
        `/subscriptions/${id}/resume`
      );
      return response;
    } catch (error) {
      console.error("Resume subscription error:", error);
      throw error;
    }
  },

  // Renew subscription
  async renewSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.post<Subscription>(
        `/subscriptions/${id}/renew`
      );
      return response;
    } catch (error) {
      console.error("Renew subscription error:", error);
      throw error;
    }
  },
};
