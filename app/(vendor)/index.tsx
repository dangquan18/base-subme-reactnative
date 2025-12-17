import { AppTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;


interface VendorPackage {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  duration_unit: string;
  duration_value: number;
  is_active: number;
  subscriber_count: number;
  average_rating: string;
  imageUrl: null | string;
  status: string;
  createdAt: string;
}

interface VendorStats {
  totalRevenue: number;
  totalPackages: number;
  activeSubscribers: number;
  pendingPackages: number;
  topPackages: VendorPackage[];
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
  
  // State khởi tạo là null hoặc mảng rỗng, KHÔNG dùng mock data
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
      
      const token = await AsyncStorage.getItem("auth_token"); 

      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại (Thiếu Token)");
        setLoading(false);
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      // --- 1. GỌI API STATS ---
      const resStats = await fetch("http://localhost:3000/vendor/stats", {
        method: "GET",
        headers: headers,
      });

      let statsData: any = null;
      
      if (resStats.ok) {
        statsData = await resStats.json();
        console.log("=== STATS DATA ===", JSON.stringify(statsData, null, 2));
      } else {
        console.log("Lỗi fetch stats:", resStats.status);
      }

      // --- 2. GỌI API ORDERS (Xử lý an toàn nếu API lỗi) ---
      try {
        const resOrders = await fetch("http://localhost:3000/vendor/orders", {
          method: "GET",
          headers: headers,
        });

        if (resOrders.ok) {
          const ordersData = await resOrders.json();
          console.log("=== ORDERS DATA ===", JSON.stringify(ordersData, null, 2));
          
          const orders = ordersData.orders || [];
          
          // Tính số subscriber thực tế từ orders (chỉ đếm active)
          const subscriberCountByPackage: { [key: number]: number } = {};
          orders.forEach((order: any) => {
            if (order.status === 'active' && order.plan_id) {
              subscriberCountByPackage[order.plan_id] = (subscriberCountByPackage[order.plan_id] || 0) + 1;
            }
          });
          
          // Sync subscriber_count vào topPackages
          if (statsData?.topPackages) {
            statsData.topPackages = statsData.topPackages.map((pkg: any) => ({
              ...pkg,
              subscriber_count: subscriberCountByPackage[pkg.id] || 0,
            }));
          }
          
          // Update activeSubscribers tổng
          if (statsData) {
            const totalActiveSubscribers = Object.values(subscriberCountByPackage).reduce((sum: number, count: any) => sum + count, 0);
            statsData.activeSubscribers = totalActiveSubscribers;
          }
          
          console.log("Subscriber counts synced:", subscriberCountByPackage);
          setStats(statsData);
          
          // Lấy 5 đơn hàng mới nhất
          const recentData = orders.slice(0, 5).map((order: any) => ({
            id: order.id,
            customerName: order.user?.name || "Khách hàng",
            packageName: order.plan?.name || "Gói dịch vụ",
            amount: order.plan?.price || "0",
            status: order.status,
            createdAt: order.payments?.[0]?.createdAt || order.start_date || new Date().toISOString(),
          }));
          console.log("Recent orders mapped:", recentData.length);
          setRecentOrders(recentData); 
        } else {
          console.log("Lỗi fetch orders:", resOrders.status);
          setStats(statsData); // Vẫn set stats nếu orders fail
          setRecentOrders([]);
        }
      } catch (orderErr) {
        console.log("API Order đang lỗi, bỏ qua:", orderErr);
        setStats(statsData); // Vẫn set stats nếu orders fail
        setRecentOrders([]);
      }

    } catch (error) {
      console.error("Error fetching dashboard:", error);
      Alert.alert("Lỗi kết nối", "Không thể tải dữ liệu Dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };


  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(value) || value === null || value === undefined) return "0 ₫";
    
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#4CAF50"; 
      case "approved": return "#4CAF50";
      case "pending": return "#FF9800"; 
      case "pending_payment": return "#FF9800";
      case "rejected": return "#F44336"; 
      case "cancelled": return "#F44336";
      default: return "#2196F3"; 
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Hoạt động";
      case "approved": return "Đã duyệt";
      case "pending": return "Chờ duyệt";
      case "pending_payment": return "Chờ thanh toán";
      case "rejected": return "Từ chối";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  /* ================= RENDER UI ================= */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION */}
      <LinearGradient
          colors={[AppTheme.colors.primary, '#576aa4ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
      >
          <View style={styles.headerContent}>
              <View>
                  <Text style={styles.headerTitle}>Vendor Portal</Text>
              </View>
              <View style={styles.avatarContainer}>
                  <Ionicons name="storefront" size={20} color="#FFF" />
              </View>
          </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyContent}>
            
            {/* REVENUE CARD */}
            <View style={styles.revenueCard}>
                <View style={styles.revenueRow}>
                    <View>
                        <Text style={styles.revenueLabel}>TỔNG DOANH THU</Text>
                        <Text style={styles.revenueValue}>
                            {stats ? formatCurrency(stats.totalRevenue) : "0 ₫"}
                        </Text>
                    </View>
                    <View style={styles.growthBadge}>
                         <Ionicons name="trending-up" size={16} color="#4CAF50" />
                         <Text style={styles.growthText}>--%</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.revenueFooter}>
                    <Text style={styles.revenueSubtext}>Cập nhật theo thời gian thực</Text>
                </View>
            </View>
            
            {/* STATS GRID */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Chỉ số quan trọng</Text>
            </View>
            
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
                        <Ionicons name="cube" size={24} color="#2196F3" />
                    </View>
                    <Text style={styles.statNumber}>{stats?.totalPackages || 0}</Text>
                    <Text style={styles.statLabel}>Tổng gói</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
                        <Ionicons name="people" size={24} color="#4CAF50" />
                    </View>
                    <Text style={styles.statNumber}>{stats?.activeSubscribers || 0}</Text>
                    <Text style={styles.statLabel}>Người đăng ký</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
                        <Ionicons name="timer" size={24} color="#FF9800" />
                    </View>
                    <Text style={styles.statNumber}>{stats?.pendingPackages || 0}</Text>
                    <Text style={styles.statLabel}>Chờ duyệt</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconBox, { backgroundColor: "#F3E5F5" }]}>
                        <Ionicons name="star" size={24} color="#9C27B0" />
                    </View>
                    <Text style={styles.statNumber}>--</Text>
                    <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
            </View>

            {/* QUICK ACTIONS */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroll}>
                <Pressable style={styles.actionBtn} onPress={() => router.push("/(vendor)/packages" as any)}>
                    <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.actionGradient}>
                        <Ionicons name="add" size={24} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.actionText}>Tạo gói</Text>
                </Pressable>
                 <Pressable style={styles.actionBtn} onPress={() => router.push("/(vendor)/orders" as any)}>
                    <View style={[styles.actionGradient, {backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD'}]}>
                        <Ionicons name="list" size={24} color="#333" />
                    </View>
                    <Text style={styles.actionText}>Đơn hàng</Text>
                </Pressable>
                <Pressable style={styles.actionBtn}>
                    <View style={[styles.actionGradient, {backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD'}]}>
                        <Ionicons name="settings-outline" size={24} color="#333" />
                    </View>
                    <Text style={styles.actionText}>Cài đặt</Text>
                </Pressable>
            </ScrollView>

            {/* TOP PACKAGES (Dữ liệu thật từ API) */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Text style={styles.sectionTitle}>Gói dịch vụ nổi bật</Text>
                <Pressable onPress={() => router.push("/(vendor)/packages" as any)}>
                    <Text style={styles.seeAll}>Xem tất cả</Text>
                </Pressable>
            </View>

            {/* Check nếu có data thì map, không thì hiện Empty State */}
            {stats?.topPackages && stats.topPackages.length > 0 ? (
                stats.topPackages.map((pkg, index) => (
                    <View key={pkg.id || index} style={styles.rowCard}>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.rowTitle}>{pkg.name}</Text>
                            <Text style={styles.rowSub}>
                                {pkg.subscriber_count} người đăng ký • {getStatusText(pkg.status)}
                            </Text>
                        </View>
                        <Text style={styles.rowPrice}>{formatCurrency(pkg.price)}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Chưa có dữ liệu gói dịch vụ</Text>
                </View>
            )}

            {/* RECENT ORDERS (Dữ liệu thật từ API) */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Text style={styles.sectionTitle}>Đơn hàng mới nhất</Text>
            </View>

            {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderRowTop}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <View style={styles.userAvatarSmall}>
                                    <Text style={styles.userInitial}>{order.customerName.charAt(0)}</Text>
                                </View>
                                <View style={{marginLeft: 10}}>
                                    <Text style={styles.orderUser}>{order.customerName}</Text>
                                    <Text style={styles.orderTime}>{formatDate(order.createdAt)}</Text>
                                </View>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                    {getStatusText(order.status)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.dividerLight} />
                        <View style={styles.orderRowBottom}>
                            <Text style={styles.orderPkgName}>{order.packageName}</Text>
                            <Text style={styles.orderPrice}>{formatCurrency(order.amount)}</Text>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={40} color="#CCC" />
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                </View>
            )}

        </View>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  
  /* HEADER */
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)"
  },

  /* REVENUE CARD */
  revenueCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  revenueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  revenueLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  revenueValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    marginTop: 6,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  growthText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  revenueFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  revenueSubtext: {
    fontSize: 12,
    color: "#999",
  },

  /* BODY */
  scrollContent: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  seeAll: {
    fontSize: 14,
    color: AppTheme.colors.primary,
    fontWeight: "600",
  },

  /* STATS GRID */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },

  /* ACTIONS */
  actionScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  actionBtn: {
    alignItems: 'center',
    marginRight: 20,
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555'
  },

  /* TOP LIST ROW */
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontWeight: '700',
    color: '#666',
    fontSize: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 12,
    color: '#999',
  },
  rowPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.colors.primary,
  },

  /* ORDER CARD */
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757575',
  },
  orderUser: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
  },
  orderRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPkgName: {
    fontSize: 14,
    color: '#666',
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  
  /* EMPTY STATE */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed'
  },
  emptyText: {
    color: '#999',
    marginTop: 8,
    fontSize: 13
  }
});