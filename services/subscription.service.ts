import { apiClient } from "./api";
import { Subscription } from "@/types";

interface CreateSubscriptionRequest {
  plan_id: number;
  payment_method: string;
  auto_renew: boolean;
}

interface UpdateSubscriptionRequest {
  auto_renew?: boolean;
}

export const subscriptionService = {
  // Get user subscriptions
  async getUserSubscriptions(status?: "active" | "expired" | "cancelled" | "pending_payment"): Promise<Subscription[]> {
    try {
      const params = status ? { status } : undefined;
      const response = await apiClient.get<Subscription[]>("/subscriptions", { params });
      return response;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },

  // Get subscription by ID
  async getSubscriptionById(id: number): Promise<Subscription> {
    try {
      const response = await apiClient.get<Subscription>(`/subscriptions/${id}`);
      return response;
    } catch (error) {
      console.error("Get subscription by ID error:", error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(data: CreateSubscriptionRequest): Promise<{ success: boolean; message: string; subscription: any }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; subscription: any }>(
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
  async updateSubscription(id: number, data: UpdateSubscriptionRequest): Promise<{ success: boolean; subscription: Subscription }> {
    try {
      const response = await apiClient.patch<{ success: boolean; subscription: Subscription }>(
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
  async cancelSubscription(id: number): Promise<{ success: boolean; subscription: Subscription }> {
    try {
      const response = await apiClient.delete<{ success: boolean; subscription: Subscription }>(
        `/subscriptions/${id}`
      );
      return response;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw error;
    }
  },

  // Pause subscription
  async pauseSubscription(id: number): Promise<{ success: boolean; subscription: Subscription }> {
    try {
      const response = await apiClient.post<{ success: boolean; subscription: Subscription }>(
        `/subscriptions/${id}/pause`
      );
      return response;
    } catch (error) {
      console.error("Pause subscription error:", error);
      throw error;
    }
  },

  // Resume subscription
  async resumeSubscription(id: number): Promise<{ success: boolean; subscription: Subscription }> {
    try {
      const response = await apiClient.post<{ success: boolean; subscription: Subscription }>(
        `/subscriptions/${id}/resume`
      );
      return response;
    } catch (error) {
      console.error("Resume subscription error:", error);
      throw error;
    }
  },

  // Renew subscription
  async renewSubscription(id: number): Promise<{ success: boolean; subscription: Subscription; payment: any }> {
    try {
      const response = await apiClient.post<{ success: boolean; subscription: Subscription; payment: any }>(
        `/subscriptions/${id}/renew`
      );
      return response;
    } catch (error) {
      console.error("Renew subscription error:", error);
      throw error;
    }
  },
};
