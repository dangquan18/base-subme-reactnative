import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { vendorService } from "@/services/vendor.service";
import { AppTheme } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface VendorStats {
  totalRevenue: number;
  newOrders: number;
  activePackages: number;
  totalSubscribers: number;
  averageRating: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growthRate: number;
  topPackages: Array<{
    id: number;
    name: string;
    subscribers: number;
    revenue: number;
  }>;
}

interface RecentOrder {
  id: number;
  customerName: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await vendorService.getStats();
      const ordersData = await vendorService.getOrders();
      
      setStats(statsData as any);
      // Map VendorOrder to RecentOrder
      const mappedOrders = ordersData.data.slice(0, 5).map(order => ({
        id: order.id,
        customerName: order.user.name,
        packageName: order.plan.name,
        amount: order.plan.price,
        status: order.status,
        createdAt: order.start_date,
      }));
      setRecentOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return AppTheme.colors.success;
      case "pending_payment":
        return AppTheme.colors.warning;
      case "expired":
        return AppTheme.colors.textLight;
      case "cancelled":
        return AppTheme.colors.error;
      default:
        return AppTheme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "pending_payment":
        return "Chờ thanh toán";
      case "expired":
        return "Đã hết hạn";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Quản lý cửa hàng của bạn</Text>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>
              {stats ? formatCurrency(stats.totalRevenue) : "0đ"}
            </Text>
            <Text style={styles.statLabel}>Tổng doanh thu</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="receipt" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{stats?.newOrders || 0}</Text>
            <Text style={styles.statLabel}>Đơn mới</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="cube" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>{stats?.activePackages || 0}</Text>
            <Text style={styles.statLabel}>Gói đang bán</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: "#FFF9C4" }]}>
              <Ionicons name="star" size={24} color="#FFC107" />
            </View>
            <Text style={styles.statValue}>{stats?.averageRating || 0}</Text>
            <Text style={styles.statLabel}>Đánh giá TB</Text>
          </View>
        </View>
      </View>

      {/* Revenue Card */}
      <View style={styles.section}>
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>Doanh thu tháng này</Text>
            <View
              style={[
                styles.growthBadge,
                {
                  backgroundColor:
                    (stats?.growthRate || 0) >= 0
                      ? AppTheme.colors.successLight
                      : AppTheme.colors.errorLight,
                },
              ]}
            >
              <Ionicons
                name={
                  (stats?.growthRate || 0) >= 0
                    ? "trending-up"
                    : "trending-down"
                }
                size={16}
                color={
                  (stats?.growthRate || 0) >= 0
                    ? AppTheme.colors.success
                    : AppTheme.colors.error
                }
              />
              <Text
                style={[
                  styles.growthText,
                  {
                    color:
                      (stats?.growthRate || 0) >= 0
                        ? AppTheme.colors.success
                        : AppTheme.colors.error,
                  },
                ]}
              >
                {stats?.growthRate || 0}%
              </Text>
            </View>
          </View>
          <Text style={styles.revenueAmount}>
            {stats ? formatCurrency(stats.revenueThisMonth) : "0đ"}
          </Text>
          <Text style={styles.revenueSubtext}>
            Tháng trước: {stats ? formatCurrency(stats.revenueLastMonth) : "0đ"}
          </Text>
        </View>
      </View>

      {/* Top Packages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gói bán chạy</Text>
          <Pressable onPress={() => router.push("/(vendor)/packages" as any)}>
            <Text style={styles.seeAllText}>Xem tất cả →</Text>
          </Pressable>
        </View>
        {stats?.topPackages.map((pkg) => (
          <View key={pkg.id} style={styles.topPackageCard}>
            <View style={styles.topPackageInfo}>
              <Text style={styles.topPackageName}>{pkg.name}</Text>
              <Text style={styles.topPackageStats}>
                {pkg.subscribers} người đăng ký
              </Text>
            </View>
            <Text style={styles.topPackageRevenue}>
              {formatCurrency(pkg.revenue)}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          <Pressable onPress={() => router.push("/(vendor)/orders" as any)}>
            <Text style={styles.seeAllText}>Xem tất cả →</Text>
          </Pressable>
        </View>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderCard}
              onPress={() => {
                // TODO: Navigate to order detail
              }}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderCustomer}>
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color={AppTheme.colors.primary}
                  />
                  <View style={styles.orderCustomerInfo}>
                    <Text style={styles.orderCustomerName}>
                      {order.customerName}
                    </Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderBody}>
                <Text style={styles.orderPackage}>{order.packageName}</Text>
                <Text style={styles.orderAmount}>
                  {formatCurrency(order.amount)}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có đơn hàng mới</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.quickActionsGrid}>
          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push("/(vendor)/packages" as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#EDE7F6" }]}>
              <Ionicons name="add-circle" size={28} color="#673AB7" />
            </View>
            <Text style={styles.quickActionText}>Thêm gói mới</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push("/(vendor)/orders" as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="list" size={28} color="#2196F3" />
            </View>
            <Text style={styles.quickActionText}>Quản lý đơn</Text>
          </Pressable>

          <Pressable style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="stats-chart" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.quickActionText}>Thống kê</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push("/(vendor)/profile" as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#FFF9C4" }]}>
              <Ionicons name="settings" size={28} color="#FFC107" />
            </View>
            <Text style={styles.quickActionText}>Cài đặt</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    ...AppTheme.shadow.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: AppTheme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppTheme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: AppTheme.colors.primary,
    fontWeight: "600",
  },
  revenueCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    ...AppTheme.shadow.md,
  },
  revenueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  revenueTitle: {
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 14,
    fontWeight: "600",
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: AppTheme.colors.textPrimary,
    marginBottom: 4,
  },
  revenueSubtext: {
    fontSize: 14,
    color: AppTheme.colors.textLight,
  },
  topPackageCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...AppTheme.shadow.sm,
  },
  topPackageInfo: {
    flex: 1,
  },
  topPackageName: {
    fontSize: 15,
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
    marginBottom: 4,
  },
  topPackageStats: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
  },
  topPackageRevenue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppTheme.colors.success,
  },
  orderCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...AppTheme.shadow.sm,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderCustomer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderCustomerInfo: {
    marginLeft: 12,
  },
  orderCustomerName: {
    fontSize: 15,
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: AppTheme.colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderBody: {
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderPackage: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    flex: 1,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: AppTheme.colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: AppTheme.colors.textLight,
    marginTop: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    ...AppTheme.shadow.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "500",
    color: AppTheme.colors.textPrimary,
    textAlign: "center",
  },
});
