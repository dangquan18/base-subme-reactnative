import { apiClient } from "./api";
import { Notification } from "@/types";

interface GetNotificationsParams {
  is_read?: boolean;
  page?: number;
  limit?: number;
}

interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export const notificationService = {
  // Get all notifications
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationsResponse> {
    try {
      const response = await apiClient.get<NotificationsResponse>("/notifications", { params });
      return response;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
      return response.count;
    } catch (error) {
      console.error("Get unread count error:", error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(id: number): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch("/notifications/read-all");
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(id: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  },
};
