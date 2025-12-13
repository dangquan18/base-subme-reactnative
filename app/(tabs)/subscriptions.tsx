import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Subscription } from "@/types";
import { AppTheme } from "@/constants/theme";

// Mock data
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    userId: "1",
    packageId: "1",
    package: {
      id: "1",
      name: "Cà phê sáng mỗi ngày",
      description: "Bắt đầu ngày mới với ly cà phê ngon",
      category: "coffee",
      price: 299000,
      frequency: "daily",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      providerId: "1",
      providerName: "The Coffee House",
      rating: 4.8,
      subscriberCount: 1234,
      features: [],
      deliveryTime: "7:00 - 9:00",
    },
    status: "active",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    nextPaymentDate: new Date("2024-01-31"),
    paymentMethod: {
      id: "1",
      type: "momo",
      name: "MoMo",
      isDefault: true,
    },
    autoRenew: true,
    deliverySchedule: [
      { id: "1", date: new Date(), time: "08:00", status: "delivered" },
      {
        id: "2",
        date: new Date(Date.now() + 86400000),
        time: "08:00",
        status: "pending",
      },
    ],
  },
  {
    id: "2",
    userId: "1",
    packageId: "2",
    package: {
      id: "2",
      name: "Cơm trưa văn phòng",
      description: "Bữa trưa healthy",
      category: "food",
      price: 899000,
      frequency: "weekly",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      providerId: "2",
      providerName: "Healthy Box",
      rating: 4.6,
      subscriberCount: 856,
      features: [],
    },
    status: "expiring_soon",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-28"),
    nextPaymentDate: new Date("2024-01-28"),
    paymentMethod: {
      id: "1",
      type: "vnpay",
      name: "VNPay",
      isDefault: false,
    },
    autoRenew: false,
  },
];

export default function MySubscriptionsScreen() {
  const router = useRouter();
  const [subscriptions] = useState(MOCK_SUBSCRIPTIONS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "expiring_soon":
        return "#FF9800";
      case "paused":
        return "#9E9E9E";
      case "canceled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "expiring_soon":
        return "Sắp hết hạn";
      case "paused":
        return "Tạm dừng";
      case "canceled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getDaysRemaining = (endDate: Date) => {
    const days = Math.ceil(
      (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Gói của tôi</Text>
        <Text style={styles.headerSubtitle}>Quản lý đăng ký của bạn</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{subscriptions.length}</Text>
            <Text style={styles.statLabel}>Gói đăng ký</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {subscriptions.filter((s) => s.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>Đang hoạt động</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#667eea" }]}>
              {formatPrice(
                subscriptions.reduce((sum, s) => sum + s.package.price, 0)
              )}
            </Text>
            <Text style={styles.statLabel}>Tháng này</Text>
          </View>
        </View>

        {/* Subscriptions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách gói</Text>

          {subscriptions.map((subscription) => (
            <Pressable
              key={subscription.id}
              style={styles.subscriptionCard}
              onPress={() =>
                router.push(`/subscription/${subscription.id}` as any)
              }
            >
              <Image
                source={{ uri: subscription.package.image }}
                style={styles.packageImage}
                defaultSource={require("@/assets/images/partial-react-logo.png")}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.packageName} numberOfLines={1}>
                    {subscription.package.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(subscription.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(subscription.status) },
                      ]}
                    >
                      {getStatusText(subscription.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.providerName}>
                  {subscription.package.providerName}
                </Text>

                <View style={styles.cardInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      Còn {getDaysRemaining(subscription.endDate)} ngày
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      {formatPrice(subscription.package.price)}/tháng
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {subscription.status === "expiring_soon" && (
                    <Pressable style={styles.renewButton}>
                      <Text style={styles.renewButtonText}>Gia hạn</Text>
                    </Pressable>
                  )}
                  {subscription.status === "active" && (
                    <Pressable style={styles.pauseButton}>
                      <Ionicons name="pause-outline" size={16} color="#666" />
                      <Text style={styles.pauseButtonText}>Tạm dừng</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>Chi tiết</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#667eea"
                    />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Add More */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/explore" as any)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#667eea" />
          <Text style={styles.addButtonText}>Khám phá thêm gói</Text>
        </Pressable>
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
  headerTitle: {
    fontSize: AppTheme.fontSize.xxxl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: AppTheme.fontSize.base,
    color: "rgba(255, 255, 255, 0.85)",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  packageImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F5F5",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  packageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  providerName: {
    fontSize: 14,
    color: "#667eea",
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  renewButton: {
    flex: 1,
    backgroundColor: "#667eea",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    marginLeft: "auto",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#667eea",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
});
