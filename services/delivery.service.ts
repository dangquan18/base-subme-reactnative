import { apiClient } from "./api";
import { DeliverySchedule, DeliveryScheduleResponse } from "@/types";

interface GetDeliveryScheduleParams {
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export const deliveryService = {
  // Get delivery schedule for a subscription
  async getSubscriptionDeliveries(
    subscriptionId: number,
    params?: GetDeliveryScheduleParams
  ): Promise<DeliveryScheduleResponse> {
    try {
      const response = await apiClient.get<DeliveryScheduleResponse>(
        `/subscriptions/${subscriptionId}/deliveries`,
        { params }
      );
      return response;
    } catch (error) {
      console.error("Get subscription deliveries error:", error);
      throw error;
    }
  },

  // Get upcoming deliveries for user
  async getUpcomingDeliveries(): Promise<DeliverySchedule[]> {
    try {
      const response = await apiClient.get<{ deliveries: DeliverySchedule[] }>(
        "/deliveries/upcoming"
      );
      return response.deliveries;
    } catch (error) {
      console.error("Get upcoming deliveries error:", error);
      throw error;
    }
  },

  // Get delivery detail
  async getDeliveryById(deliveryId: number): Promise<DeliverySchedule> {
    try {
      const response = await apiClient.get<DeliverySchedule>(
        `/deliveries/${deliveryId}`
      );
      return response;
    } catch (error) {
      console.error("Get delivery detail error:", error);
      throw error;
    }
  },

  // Update delivery note
  async updateDeliveryNote(
    deliveryId: number,
    note: string
  ): Promise<{ success: boolean; delivery: DeliverySchedule }> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        delivery: DeliverySchedule;
      }>(`/deliveries/${deliveryId}/note`, { delivery_note: note });
      return response;
    } catch (error) {
      console.error("Update delivery note error:", error);
      throw error;
    }
  },

  // Report delivery issue
  async reportDeliveryIssue(
    deliveryId: number,
    issue: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>(`/deliveries/${deliveryId}/report`, { issue });
      return response;
    } catch (error) {
      console.error("Report delivery issue error:", error);
      throw error;
    }
  },

  // Confirm delivery received
  async confirmDelivery(
    deliveryId: number
  ): Promise<{ success: boolean; delivery: DeliverySchedule }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        delivery: DeliverySchedule;
      }>(`/deliveries/${deliveryId}/confirm`);
      return response;
    } catch (error) {
      console.error("Confirm delivery error:", error);
      throw error;
    }
  },
};
