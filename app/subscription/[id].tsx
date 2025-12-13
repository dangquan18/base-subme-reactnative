import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Subscription } from "@/types";

// Mock subscription detail
const MOCK_SUBSCRIPTION: Subscription = {
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
    last4: "9876",
    isDefault: true,
  },
  autoRenew: true,
  deliverySchedule: [
    {
      id: "1",
      date: new Date(Date.now() - 86400000),
      time: "08:00",
      status: "delivered",
    },
    { id: "2", date: new Date(), time: "08:00", status: "delivered" },
    {
      id: "3",
      date: new Date(Date.now() + 86400000),
      time: "08:00",
      status: "pending",
    },
    {
      id: "4",
      date: new Date(Date.now() + 172800000),
      time: "08:00",
      status: "pending",
    },
    {
      id: "5",
      date: new Date(Date.now() + 259200000),
      time: "08:00",
      status: "pending",
    },
  ],
};

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "missed":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Đã giao";
      case "pending":
        return "Chờ giao";
      case "missed":
        return "Bỏ lỡ";
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Package Info */}
        <View style={styles.packageCard}>
          <Image
            source={{ uri: MOCK_SUBSCRIPTION.package.image }}
            style={styles.packageImage}
            defaultSource={require("@/assets/images/partial-react-logo.png")}
          />
          <View style={styles.packageInfo}>
            <Text style={styles.packageName}>
              {MOCK_SUBSCRIPTION.package.name}
            </Text>
            <Text style={styles.providerName}>
              {MOCK_SUBSCRIPTION.package.providerName}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>

        {/* Subscription Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin gói</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
              <Text style={styles.infoValue}>
                {formatDate(MOCK_SUBSCRIPTION.startDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày kết thúc</Text>
              <Text style={styles.infoValue}>
                {formatDate(MOCK_SUBSCRIPTION.endDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thanh toán tiếp theo</Text>
              <Text style={styles.infoValue}>
                {formatDate(MOCK_SUBSCRIPTION.nextPaymentDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giá gói</Text>
              <Text style={styles.infoValue}>
                {formatPrice(MOCK_SUBSCRIPTION.package.price)}/tháng
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Pressable style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <Ionicons name="wallet-outline" size={24} color="#667eea" />
              <View style={styles.paymentText}>
                <Text style={styles.paymentName}>
                  {MOCK_SUBSCRIPTION.paymentMethod.name}
                </Text>
                <Text style={styles.paymentDetails}>
                  •••• {MOCK_SUBSCRIPTION.paymentMethod.last4}
                </Text>
              </View>
            </View>
            <Pressable style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Thay đổi</Text>
            </Pressable>
          </Pressable>

          <View style={styles.autoRenewCard}>
            <View style={styles.autoRenewInfo}>
              <Ionicons name="refresh-outline" size={20} color="#667eea" />
              <Text style={styles.autoRenewText}>Tự động gia hạn</Text>
            </View>
            <Text style={styles.autoRenewStatus}>
              {MOCK_SUBSCRIPTION.autoRenew ? "Bật" : "Tắt"}
            </Text>
          </View>
        </View>

        {/* Delivery Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch giao hàng</Text>
          {MOCK_SUBSCRIPTION.deliverySchedule?.map((delivery, index) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryDate}>
                <Text style={styles.deliveryDay}>
                  {new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(
                    delivery.date
                  )}
                </Text>
                <Text style={styles.deliveryMonth}>
                  Th
                  {new Intl.DateTimeFormat("vi-VN", {
                    month: "2-digit",
                  }).format(delivery.date)}
                </Text>
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTime}>{delivery.time}</Text>
                <View
                  style={[
                    styles.deliveryStatus,
                    { backgroundColor: getStatusColor(delivery.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.deliveryStatusText,
                      { color: getStatusColor(delivery.status) },
                    ]}
                  >
                    {getStatusText(delivery.status)}
                  </Text>
                </View>
              </View>
              {index < MOCK_SUBSCRIPTION.deliverySchedule!.length - 1 && (
                <View style={styles.deliveryDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
            <Text style={styles.actionButtonText}>Báo vấn đề</Text>
          </Pressable>

          <Pressable style={styles.actionButtonSecondary}>
            <Ionicons name="pause-outline" size={20} color="#666" />
            <Text style={styles.actionButtonSecondaryText}>Tạm dừng gói</Text>
          </Pressable>

          <Pressable style={styles.actionButtonSecondary}>
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <Text
              style={[styles.actionButtonSecondaryText, { color: "#F44336" }]}
            >
              Hủy đăng ký
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  packageCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  packageImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  packageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: "#667eea",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentText: {
    gap: 4,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  paymentDetails: {
    fontSize: 13,
    color: "#666",
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  autoRenewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoRenewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoRenewText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  autoRenewStatus: {
    fontSize: 15,
    fontWeight: "600",
    color: "#667eea",
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryDate: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 50,
  },
  deliveryDay: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  deliveryMonth: {
    fontSize: 12,
    color: "#666",
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTime: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  deliveryStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  deliveryStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    position: "absolute",
    bottom: 0,
    left: 82,
    right: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F44336",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F44336",
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
});
