import { AppTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// LƯU Ý: Nếu chạy trên Mobile thật (Android/iOS), hãy đổi localStorage thành AsyncStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

/* ================= TYPES ================= */

// Định nghĩa trạng thái đơn hàng
type OrderStatus = "all" | "pending" | "active" | "expired" | "cancelled" | "rejected";

interface VendorOrder {
  id: number;
  status: string; // 'active', 'pending', etc.
  start_date: string;
  end_date: string;
  // Cấu trúc mới từ API
  plan: {
    id: number;
    name: string;
    price: number;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount: number | string) => {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
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
    year: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "#4CAF50"; // Xanh lá
    case "pending": return "#FF9800"; // Cam
    case "expired": return "#9E9E9E"; // Xám
    case "cancelled": return "#F44336"; // Đỏ
    case "rejected": return "#D32F2F"; // Đỏ đậm
    default: return "#2196F3"; // Xanh dương
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Đang hoạt động";
    case "pending": return "Chờ duyệt";
    case "expired": return "Hết hạn";
    case "cancelled": return "Đã hủy";
    case "rejected": return "Đã từ chối";
    default: return status;
  }
};

/* ================= COMPONENT ================= */

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Logic lọc client-side
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Lấy token (Lưu ý: localStorage chỉ chạy trên web, mobile cần AsyncStorage)
      const token = localStorage.getItem("auth_token");
      
      const res = await fetch("http://localhost:3000/vendor/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Gắn token vào header
        },
      });

      if (res.ok) {
        const data = await res.json();
        // SỬA: Lấy data.orders theo cấu trúc JSON mới
        const list = data.orders || [];
        setOrders(list);
      } else {
        console.log("Fetch orders failed");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let result = orders;

    // 1. Filter by Status
    if (selectedStatus !== "all") {
      result = result.filter(o => o.status === selectedStatus);
    }

    // 2. Filter by Search (Tên khách hoặc Tên gói)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        o =>
          o.user?.name.toLowerCase().includes(lowerQuery) ||
          o.plan?.name.toLowerCase().includes(lowerQuery) ||
          String(o.id).includes(lowerQuery)
      );
    }

    setFilteredOrders(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // --- ACTIONS (Duyệt/Hủy đơn) ---
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`http://localhost:3000/vendor/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            Alert.alert("Thành công", `Đã cập nhật đơn hàng #${orderId}`);
            fetchOrders(); 
        } else {
            Alert.alert("Lỗi", "Cập nhật thất bại");
        }
    } catch (e) {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi kết nối");
    }
  };

  /* ================= RENDER ITEMS ================= */

  const renderStatusTabs = () => {
    const tabs: { key: OrderStatus; label: string }[] = [
      { key: "all", label: "Tất cả" },
      { key: "pending", label: "Chờ duyệt" },
      { key: "active", label: "Hoạt động" },
      { key: "expired", label: "Hết hạn" },
      { key: "cancelled", label: "Đã hủy" },
    ];

    return (
      <View style={{ height: 50 }}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = selectedStatus === item.key;
            return (
              <TouchableOpacity
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setSelectedStatus(item.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: VendorOrder }) => {
    const isPending = item.status === 'pending';

    return (
      <View style={styles.card}>
        {/* Header Card: ID & Date */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          {/* Hiển thị ngày tạo (dùng start_date làm ngày tạo tạm thời nếu API k có created_at) */}
          <Text style={styles.orderDate}>{formatDate(item.start_date)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Content: Customer & Plan */}
        <View style={styles.cardBody}>
          {/* Customer Info */}
          <View style={styles.row}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.user?.name ? item.user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.customerName}>{item.user?.name || "Unknown User"}</Text>
              <Text style={styles.customerEmail}>{item.user?.email || ""}</Text>
            </View>
          </View>

          {/* Plan Info */}
          <View style={styles.planContainer}>
             <View style={{flex: 1}}>
                 <Text style={styles.planLabel}>Gói đăng ký</Text>
                 <Text style={styles.planName}>{item.plan?.name || "Tên gói..."}</Text>
                 {/* SỬA: Hiển thị ngày hết hạn thay vì duration text */}
                 <Text style={styles.planDuration}>
                    Hết hạn: {formatDate(item.end_date)}
                 </Text>
             </View>
             <View style={{alignItems: 'flex-end'}}>
                 {/* SỬA: Lấy price từ item.plan.price */}
                 <Text style={styles.priceText}>{formatCurrency(item.plan?.price || 0)}</Text>
                 <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                 </View>
             </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isPending && (
            <View style={styles.actionFooter}>
                <TouchableOpacity 
                    style={[styles.btnAction, styles.btnReject]}
                    onPress={() => handleUpdateStatus(item.id, 'rejected')}
                >
                    <Text style={styles.btnTextReject}>Từ chối</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.btnAction, styles.btnApprove]}
                    onPress={() => handleUpdateStatus(item.id, 'active')}
                >
                    <Text style={styles.btnTextApprove}>Duyệt đơn</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>
    );
  };

  /* ================= MAIN UI ================= */

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER FIXED */}
      <LinearGradient
              colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
              style={styles.header}
            >
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        
        {/* Search Input */}
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput 
                style={styles.searchInput}
                placeholder="Tìm tên khách, tên gói, mã đơn..."
                placeholderTextColor="#CCC"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
            )}
        </View>
      </LinearGradient>

      {/* FILTER TABS */}
      <View style={styles.filterSection}>
        {renderStatusTabs()}
      </View>

      {/* ORDER LIST */}
      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        </View>
      ) : (
        <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào</Text>
                </View>
            }
        />
      )}
    </View>
  );
}

/* ================= STYLES ================= */
// (Giữ nguyên styles như cũ của bạn, không cần thay đổi)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  /* HEADER */
  header: { padding: 20, paddingTop: 40, paddingBottom: 20 },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 16,
    textAlign: 'center'
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFF',
    fontSize: 14,
  },

  /* TABS */
  filterSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  tabContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    height: 36,
  },
  tabItemActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  /* LIST & CARD */
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  orderDate: {
    fontSize: 13,
    color: '#888'
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  
  /* CARD BODY */
  cardBody: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#2196F3',
    fontWeight: '700',
    fontSize: 16
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  customerEmail: {
    fontSize: 13,
    color: '#888'
  },
  
  /* PLAN INFO BOX */
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  planLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 2
  },
  planDuration: {
    fontSize: 12,
    color: '#666'
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.primary,
    marginBottom: 6
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* FOOTER ACTIONS */
  actionFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
    gap: 12,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReject: {
    backgroundColor: '#FFEBEE',
  },
  btnApprove: {
    backgroundColor: '#E8F5E9',
  },
  btnTextReject: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 14
  },
  btnTextApprove: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 14
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
    fontSize: 14
  }
});