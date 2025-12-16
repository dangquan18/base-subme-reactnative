import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Subscription } from "@/types";
import { AppTheme } from "@/constants/theme";
import { subscriptionService } from "@/services/subscription.service";

export default function MySubscriptionsScreen() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      // Only load active subscriptions
      const data = await subscriptionService.getUserSubscriptions('active');
      setSubscriptions(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  const handlePauseSubscription = async (id: string) => {
    Alert.alert(
      'Tạm dừng đăng ký',
      'Bạn có chắc muốn tạm dừng đăng ký này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạm dừng',
          onPress: async () => {
            try {
              await subscriptionService.pauseSubscription(id);
              Alert.alert('Thành công', 'Đã tạm dừng đăng ký');
              loadSubscriptions();
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạm dừng đăng ký');
            }
          },
        },
      ]
    );
  };

  const handleResumeSubscription = async (id: string) => {
    try {
      await subscriptionService.resumeSubscription(id);
      Alert.alert('Thành công', 'Đã tiếp tục đăng ký');
      loadSubscriptions();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tiếp tục đăng ký');
    }
  };

  const handleCancelSubscription = async (id: string) => {
    Alert.alert(
      'Hủy đăng ký',
      'Bạn có chắc muốn hủy đăng ký này? Hành động này không thể hoàn tác.',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đăng ký',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionService.cancelSubscription(id);
              Alert.alert('Thành công', 'Đã hủy đăng ký');
              loadSubscriptions();
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể hủy đăng ký');
            }
          },
        },
      ]
    );
  };

  const handleRenewSubscription = async (id: string) => {
    try {
      await subscriptionService.renewSubscription(id);
      Alert.alert('Thành công', 'Đã gia hạn đăng ký');
      loadSubscriptions();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gia hạn đăng ký');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "expired":
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
       
        </View>

        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có đăng ký nào</Text>
            <Text style={styles.emptySubtext}>Khám phá các gói dịch vụ mới</Text>
            <Pressable 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.exploreButtonText}>Khám phá</Text>
            </Pressable>
          </View>
        ) : (
          <>
        {/* Subscriptions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách gói</Text>

          {subscriptions.map((subscription) => {
            // Skip subscriptions without plan data
            if (!subscription.plan) return null;
            
            return (
            <Pressable
              key={subscription.id}
              style={styles.subscriptionCard}
              onPress={() =>
                router.push(`/subscription/${subscription.id}` as any)
              }
            >
              {(subscription.plan.imageUrl || subscription.plan.image) ? (
                <Image
                  source={{ uri: subscription.plan.imageUrl || subscription.plan.image }}
                  style={styles.packageImage}
                  defaultSource={require("@/assets/images/partial-react-logo.png")}
                />
              ) : (
                <View style={[styles.packageImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={32} color="#ccc" />
                </View>
              )}

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.packageName} numberOfLines={1}>
                    {subscription.plan.name}
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
                  {subscription.plan.vendor?.name || 'N/A'}
                </Text>

                <View style={styles.cardInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      {new Date(subscription.end_date).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      {formatPrice(subscription.plan.price || 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  
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
            );
          })}
        </View>

        {/* Add More */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/explore" as any)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#667eea" />
          <Text style={styles.addButtonText}>Khám phá thêm gói</Text>
        </Pressable>
          </>
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
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
  },
  resumeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#667eea",
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
