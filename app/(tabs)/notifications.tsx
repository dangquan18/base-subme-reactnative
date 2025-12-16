import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "@/types";
import { AppTheme } from "@/constants/theme";
import { notificationService } from "@/services/notification.service";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "delivery":
        return "bicycle";
      case "payment":
        return "card";
      case "promotion":
        return "pricetag";
      case "system":
        return "information-circle";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "delivery":
        return AppTheme.colors.success;
      case "payment":
        return AppTheme.colors.warning;
      case "promotion":
        return AppTheme.colors.error;
      case "system":
        return AppTheme.colors.info;
      default:
        return AppTheme.colors.primary;
    }
  };

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      Alert.alert('Thành công', 'Đã đánh dấu tất cả là đã đọc');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      console.log('🔄 Deleting notification:', deleteConfirmId);
      await notificationService.deleteNotification(deleteConfirmId);
      
      // Reload lại danh sách sau khi xóa
      await loadNotifications();
      console.log('✅ Notification deleted and list refreshed');
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      Alert.alert('Lỗi', 'Không thể xóa thông báo');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  const markAsRead_OLD = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead_OLD = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Thông báo</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}>{unreadCount} chưa đọc</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead} style={styles.markAllButton}>
              <Ionicons name="checkmark-done" size={20} color="#FFF" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có thông báo</Text>
          </View>
        ) : (
          <>
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.is_read && styles.notificationCardUnread,
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationIcon}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      getNotificationColor(notification.type) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                {!notification.is_read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTime(new Date(notification.created_at))}
              </Text>
            </View>

            <Pressable 
              style={styles.deleteButton}
              onPress={() => handleDelete(notification.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </Pressable>
          </Pressable>
        ))}
          </>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="trash-outline" size={48} color="#F44336" />
            </View>
            <Text style={styles.modalTitle}>Xóa thông báo</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc muốn xóa thông báo này?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelButton} onPress={cancelDelete}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.modalDeleteButton} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: AppTheme.fontSize.xxxl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textWhite,
    marginBottom: 4,
  },
  unreadCount: {
    fontSize: AppTheme.fontSize.sm,
    color: "rgba(255, 255, 255, 0.85)",
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: AppTheme.spacing.lg,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.backgroundWhite,
    marginHorizontal: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.md,
    padding: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    ...AppTheme.shadow.sm,
  },
  notificationCardUnread: {
    backgroundColor: AppTheme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary + "20",
  },
  notificationIcon: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: AppTheme.fontSize.md,
    fontWeight: AppTheme.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppTheme.colors.primary,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: AppTheme.fontSize.xs,
    color: AppTheme.colors.textLight,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.textLight,
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    ...AppTheme.shadow.lg,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent:"center"
  },
  modalCancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: AppTheme.fontSize.md,
    color: AppTheme.colors.textLight,
    marginTop: 16,
  },
});
