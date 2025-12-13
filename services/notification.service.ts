import { apiClient } from "./api";
import { Notification } from "@/types";

export const notificationService = {
  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>("/notifications");
      return response;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
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
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        "/notifications/unread-count"
      );
      return response.count;
    } catch (error) {
      console.error("Get unread count error:", error);
      throw error;
    }
  },
};
