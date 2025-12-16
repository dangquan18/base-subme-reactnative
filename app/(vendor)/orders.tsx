import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { vendorService } from "@/services/vendor.service";
import { AppTheme } from "@/constants/theme";

interface VendorOrder {
  id: number;
  customerName: string;
  customerEmail: string;
  packageName: string;
  amount: number;
  status: "pending_payment" | "active" | "expired" | "cancelled";
  createdAt: string;
  startDate: string;
  endDate: string;
  paymentMethod?: string;
}

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getOrders();
      
      // Map VendorOrder từ API sang RecentOrder interface
      const mappedOrders: VendorOrder[] = response.data.map(order => ({
        id: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        packageName: order.plan.name,
        amount: order.plan.price,
        status: order.status as VendorOrder['status'],
        createdAt: order.start_date,
        startDate: order.start_date,
        endDate: order.end_date,
        paymentMethod: "VNPay",
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = (orderId: number, newStatus: VendorOrder["status"]) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn đổi trạng thái đơn hàng thành "${getStatusText(newStatus)}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              // TODO: Ghép API thật
              // await vendorService.updateOrderStatus(orderId, newStatus);
              
              setOrders(
                orders.map((order) =>
                  order.id === orderId ? { ...order, status: newStatus } : order
                )
              );
              Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
            }
          },
        },
      ]
    );
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
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "checkmark-circle";
      case "pending_payment":
        return "time";
      case "expired":
        return "close-circle";
      case "cancelled":
        return "ban";
      default:
        return "help-circle";
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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Đơn hàng</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} đơn · {filteredOrders.length} hiển thị
        </Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={AppTheme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email, gói..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[
          { key: "all", label: "Tất cả", count: orders.length },
          { key: "active", label: "Đang hoạt động", count: orders.filter(o => o.status === "active").length },
          { key: "pending_payment", label: "Chờ thanh toán", count: orders.filter(o => o.status === "pending_payment").length },
          { key: "expired", label: "Đã hết hạn", count: orders.filter(o => o.status === "expired").length },
          { key: "cancelled", label: "Đã hủy", count: orders.filter(o => o.status === "cancelled").length },
        ].map((filter) => (
          <Pressable
            key={filter.key}
            style={[
              styles.filterChip,
              statusFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label} ({filter.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Order List */}
      <ScrollView
        style={styles.orderList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Customer Info */}
              <View style={styles.orderHeader}>
                <View style={styles.customerInfo}>
                  <Ionicons
                    name="person-circle"
                    size={48}
                    color={AppTheme.colors.primary}
                  />
                  <View style={styles.customerDetails}>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.customerEmail}>{order.customerEmail}</Text>
                    <Text style={styles.orderDate}>
                      Đặt: {formatDateTime(order.createdAt)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + "20" },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(order.status) as any}
                    size={14}
                    color={getStatusColor(order.status)}
                  />
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

              {/* Package Info */}
              <View style={styles.orderBody}>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageLabel}>Gói dịch vụ</Text>
                  <Text style={styles.packageName}>{order.packageName}</Text>
                </View>
                <View style={styles.priceInfo}>
                  <Text style={styles.amountLabel}>Giá trị</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(order.amount)}
                  </Text>
                </View>
              </View>

              {/* Subscription Period */}
              <View style={styles.periodContainer}>
                <View style={styles.periodItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={AppTheme.colors.textLight}
                  />
                  <Text style={styles.periodText}>
                    {formatDate(order.startDate)} → {formatDate(order.endDate)}
                  </Text>
                </View>
                {order.paymentMethod && (
                  <View style={styles.periodItem}>
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={AppTheme.colors.textLight}
                    />
                    <Text style={styles.periodText}>{order.paymentMethod}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {order.status === "pending_payment" && (
                <View style={styles.actionsContainer}>
                  <Pressable
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleUpdateStatus(order.id, "active")}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Xác nhận thanh toán</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleUpdateStatus(order.id, "cancelled")}
                  >
                    <Ionicons name="close" size={20} color={AppTheme.colors.error} />
                    <Text style={[styles.actionButtonText, { color: AppTheme.colors.error }]}>
                      Hủy
                    </Text>
                  </Pressable>
                </View>
              )}

              {order.status === "active" && (
                <View style={styles.actionsContainer}>
                  <Pressable
                    style={[styles.actionButton, styles.expireButton]}
                    onPress={() => handleUpdateStatus(order.id, "expired")}
                  >
                    <Ionicons name="time-outline" size={20} color={AppTheme.colors.textLight} />
                    <Text style={[styles.actionButtonText, { color: AppTheme.colors.textLight }]}>
                      Đánh dấu hết hạn
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    ...AppTheme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: AppTheme.colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.divider,
  },
  filterChipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  orderList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...AppTheme.shadow.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: AppTheme.colors.textLight,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AppTheme.colors.divider,
  },
  packageInfo: {
    flex: 1,
  },
  packageLabel: {
    fontSize: 12,
    color: AppTheme.colors.textLight,
    marginBottom: 4,
  },
  packageName: {
    fontSize: 15,
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 12,
    color: AppTheme.colors.textLight,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 17,
    fontWeight: "700",
    color: AppTheme.colors.primary,
  },
  periodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    gap: 12,
  },
  periodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  periodText: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  approveButton: {
    backgroundColor: AppTheme.colors.success,
  },
  cancelButton: {
    backgroundColor: AppTheme.colors.backgroundCard,
  },
  expireButton: {
    backgroundColor: AppTheme.colors.backgroundCard,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: AppTheme.colors.textLight,
    marginTop: 16,
  },
});
