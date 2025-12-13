import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "@/types";
import { AppTheme } from "@/constants/theme";

// Mock data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    userId: "1",
    type: "delivery",
    title: "Giao hàng sắp tới",
    message: "Gói cà phê của bạn sẽ giao lúc 8h sáng nay",
    read: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    userId: "1",
    type: "payment",
    title: "Sắp hết hạn",
    message: "Còn 2 ngày nữa hết hạn – Gia hạn ngay để nhận ưu đãi",
    read: false,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: "3",
    userId: "1",
    type: "promotion",
    title: "Ưu đãi đặc biệt",
    message: "Giảm 20% cho gói Gym Premium tháng này!",
    read: false,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    userId: "1",
    type: "system",
    title: "Đánh giá dịch vụ",
    message: "Hãy cho chúng tôi biết trải nghiệm của bạn với gói Cà phê",
    read: true,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);

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

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.notificationCardUnread,
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
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTime(notification.createdAt)}
              </Text>
            </View>
          </Pressable>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>Không có thông báo</Text>
          </View>
        )}
      </ScrollView>
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
