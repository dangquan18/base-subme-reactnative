import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface VendorPackage {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_value: number;
  duration_unit: string;
  status: "pending" | "approved" | "rejected";
  subscriber_count: number;
  category_id: number;
  image?: string | null;
  average_rating?: string;
  estimated_revenue?: number;
  category?: {
    name: string;
  };
  createdAt?: string;
}

export default function VendorPackageDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [packageData, setPackageData] = useState<VendorPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackage();
  }, [id]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`http://localhost:3000/vendor/packages/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load package");
      }

      const data = await response.json();
      
      // Lấy số subscriber thực tế từ orders
      try {
        const ordersResponse = await fetch("http://localhost:3000/vendor/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const orders = ordersData.orders || [];
          
          // Đếm số subscription active cho package này
          const activeSubscribers = orders.filter(
            (order: any) => order.plan_id === data.id && order.status === 'active'
          ).length;
          
          // Tính doanh thu thực tế
          const totalRevenue = activeSubscribers * parseFloat(data.price);
          
          // Sync subscriber_count
          data.subscriber_count = activeSubscribers;
          data.estimated_revenue = totalRevenue;
          
          console.log(`Package ${data.id}: ${activeSubscribers} active subscribers, revenue: ${totalRevenue}`);
        }
      } catch (orderErr) {
        console.log("Không thể tải orders, dùng subscriber_count từ DB:", orderErr);
      }
      
      setPackageData(data);
    } catch (error) {
      console.error("Error loading package:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin gói dịch vụ");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa gói dịch vụ này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("auth_token");
              const response = await fetch(`http://localhost:3000/vendor/packages/${id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error("Failed to delete");
              }

              Alert.alert("Thành công", "Đã xóa gói dịch vụ");
              router.back();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa gói dịch vụ");
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "rejected":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  if (loading || !packageData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const estimatedRevenue = (packageData.subscriber_count || 0) * Number(packageData.price);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết gói dịch vụ</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(packageData.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(packageData.status)}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Package Image */}
        {packageData.image && (
          <Image source={{ uri: packageData.image }} style={styles.packageImage} />
        )}

        {/* Main Info Card */}
        <View style={styles.card}>
          <Text style={styles.categoryText}>
            {packageData.category?.name || "Chưa phân loại"}
          </Text>
          <Text style={styles.packageName}>{packageData.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(packageData.price)}</Text>
            <Text style={styles.duration}>
              / {packageData.duration_value} {packageData.duration_unit}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="people" size={28} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{packageData.subscriber_count || 0}</Text>
            <Text style={styles.statLabel}>Người đăng ký</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="star" size={28} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>
              {packageData.average_rating ? Number(packageData.average_rating).toFixed(1) : "0.0"}
            </Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="cash" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>
              {(estimatedRevenue / 1000000).toFixed(3)}M
            </Text>
            <Text style={styles.statLabel}>Doanh thu/tháng</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={22} color={AppTheme.colors.primary} />
            <Text style={styles.cardTitle}>Mô tả</Text>
          </View>
          <Text style={styles.description}>{packageData.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={22} color={AppTheme.colors.primary} />
            <Text style={styles.cardTitle}>Thông tin chi tiết</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã gói</Text>
            <Text style={styles.detailValue}>#{packageData.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Danh mục</Text>
            <Text style={styles.detailValue}>{packageData.category?.name || "N/A"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời hạn</Text>
            <Text style={styles.detailValue}>
              {packageData.duration_value} {packageData.duration_unit}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày tạo</Text>
            <Text style={styles.detailValue}>
              {packageData.createdAt
                ? new Date(packageData.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            // TODO: Navigate to edit screen
            Alert.alert("Thông báo", "Chức năng chỉnh sửa đang phát triển");
          }}
        >
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
  },
  packageImage: {
    width: width,
    height: 200,
    resizeMode: "cover",
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryText: {
    fontSize: 12,
    color: AppTheme.colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  packageName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: AppTheme.colors.primary,
  },
  duration: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 15,
    color: "#666",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  bottomBar: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
// // Lưu ý: React Native thuần không có localStorage, hãy dùng AsyncStorage nếu chạy trên mobile thật.
// // Ở đây tôi giữ nguyên localStorage theo code cũ của bạn vì có thể bạn đang chạy web hoặc có shim.
// import { Picker } from "@react-native-picker/picker";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Modal,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";

// /* ================= TYPES ================= */

// type DurationUnit = "ngày" | "tuần" | "tháng" | "năm";

// const DURATION_UNITS: DurationUnit[] = ["ngày", "tuần", "tháng", "năm"];

// // Định nghĩa Status để lọc
// type PackageStatus = "all" | "pending" | "approved" | "rejected";

// interface Category {
//   id: number;
//   name: string;
// }

// interface VendorPackage {
//   id: number;
//   name: string;
//   description: string;
//   price: string; // API trả về string "12.00"
//   duration_value: number;
//   duration_unit: DurationUnit;
//   status: "pending" | "approved" | "rejected";
//   subscriber_count: number; // API là subscriber_count
//   category_id: number;
//   image?: string | null; // API là imageUrl
//   category?: {
//     name: string;
//   };
//   createdAt?: string;
// }

// /* ================= HELPER ================= */

// const formatCurrency = (amount: string | number) => {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(Number(amount));
// };

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "approved":
//       return "#4CAF50"; // Green
//     case "pending":
//       return "#FF9800"; // Orange
//     case "rejected":
//       return "#F44336"; // Red
//     default:
//       return "#9E9E9E"; // Grey
//   }
// };

// const getStatusLabel = (status: string) => {
//   switch (status) {
//     case "approved":
//       return "Đã duyệt";
//     case "pending":
//       return "Chờ duyệt";
//     case "rejected":
//       return "Từ chối";
//     default:
//       return status;
//   }
// };

// /* ================= COMPONENT ================= */

// export default function VendorPackages() {
//   const router = useRouter();
//   const [packages, setPackages] = useState<VendorPackage[]>([]);
//   const [filteredPackages, setFilteredPackages] = useState<VendorPackage[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
  
//   // State cho bộ lọc
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState<PackageStatus>("all");

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     duration_value: "",
//     duration_unit: "tháng" as DurationUnit,
//     category_id: "",
//     features: "",
//     image: "",
//   });

//   /* ================= FETCH ================= */

//   useEffect(() => {
//     fetchCategories();
//     fetchPackages();
//   }, []);

//   // Lọc dữ liệu mỗi khi packages, search hoặc status thay đổi
//   useEffect(() => {
//     filterPackages();
//   }, [packages, searchQuery, selectedStatus]);

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch("http://localhost:3000/categories");
//       const data = await res.json();
//       setCategories(data);
//     } catch {
//       // Alert.alert("Lỗi", "Không tải được danh mục");
//       console.log("Err cat");
//     }
//   };

//   const fetchPackages = async () => {
//     try {
//       setLoading(true);
//       // Gọi API thật để lấy danh sách gói
//       // Lấy token từ localStorage (hoặc AsyncStorage tùy môi trường)
//       const token = localStorage.getItem("auth_token");

//       const res = await fetch("http://localhost:3000/vendor/packages", {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`, // Đã gắn Bearer Token
//         }
//       });
      
//       if (!res.ok) throw new Error("Failed to fetch");
      
//       const data = await res.json();
//       setPackages(data); // data format giống như bạn cung cấp
//     } catch (error) {
//       Alert.alert("Lỗi", "Không tải được danh sách gói dịch vụ");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const filterPackages = () => {
//     let data = packages;

//     // 1. Lọc theo Tab Status
//     if (selectedStatus !== "all") {
//       data = data.filter((p) => p.status === selectedStatus);
//     }

//     // 2. Lọc theo Search Query
//     if (searchQuery) {
//       data = data.filter(
//         (p) =>
//           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.description.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
//     setFilteredPackages(data);
//   };

//   /* ================= ACTION ================= */

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchPackages();
//   };

//   const openCreateModal = () => {
//     setFormData({
//       name: "",
//       description: "",
//       price: "",
//       duration_value: "",
//       duration_unit: "tháng",
//       category_id: "",
//       features: "",
//       image: "",
//     });
//     setModalVisible(true);
//   };

//   const handleSubmit = async () => {
//     if (!formData.name || !formData.price || !formData.duration_value || !formData.category_id) {
//       Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin bắt buộc");
//       return;
//     }

//     const payload = {
//       name: formData.name,
//       description: formData.description,
//       price: Number(formData.price),
//       duration_value: Number(formData.duration_value),
//       duration_unit: formData.duration_unit,
//       category_id: Number(formData.category_id),
//       features: formData.features,
//       image: formData.image, // Map với field backend (check lại là image hay imageUrl)
//     };

//     try {
//       const token = localStorage.getItem("auth_token");
//       const res = await fetch("http://localhost:3000/vendor/packages", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`, // Đã gắn Bearer Token
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error();

//       Alert.alert("Thành công", "Đã tạo gói mới");
//       setModalVisible(false);
//       fetchPackages();
//     } catch {
//       Alert.alert("Lỗi", "Tạo gói thất bại");
//     }
//   };

//   /* ================= UI COMPONENTS ================= */

//   // Render các Tab trạng thái
//   const renderStatusTabs = () => (
//     <View style={styles.tabContainer}>
//       {(["all", "pending", "approved", "rejected"] as PackageStatus[]).map((status) => (
//         <TouchableOpacity
//           key={status}
//           style={[
//             styles.tabItem,
//             selectedStatus === status && styles.tabItemActive,
//           ]}
//           onPress={() => setSelectedStatus(status)}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               selectedStatus === status && styles.tabTextActive,
//             ]}
//           >
//             {status === "all" ? "Tất cả" : getStatusLabel(status)}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );

//   // Render từng Card gói dịch vụ
//   const renderPackageItem = (item: VendorPackage) => (
//     <TouchableOpacity key={item.id} style={styles.card} onPress={() => router.push(`/package/${item.id}`)}>
//         {/* Header Card: Tên + Status */}
//         <View style={styles.cardHeader}>
//             <View style={{flex: 1}}>
//                  <Text style={styles.cardCategory}>{item.category?.name || "Dịch vụ"}</Text>
//                  <Text style={styles.cardTitle}>{item.name}</Text>
//             </View>
//             <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}> 
//                 <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
//                     {getStatusLabel(item.status)}
//                 </Text>
//             </View>
//         </View>

//         {/* Nội dung chính */}
//         <View style={styles.cardBody}>
//             <Text style={styles.cardPrice}>
//                 {formatCurrency(item.price)} 
//                 <Text style={styles.cardDuration}> / {item.duration_value} {item.duration_unit}</Text>
//             </Text>
//             <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
//         </View>

//         {/* Footer: Thông tin thêm */}
//         <View style={styles.cardFooter}>
//              <View style={styles.statItem}>
//                 <Ionicons name="people-outline" size={16} color="#666" />
//                 <Text style={styles.statText}>{item.subscriber_count} đăng ký</Text>
//              </View>
//              <Text style={styles.dateText}>
//                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
//              </Text>
//         </View>
//     </TouchableOpacity>
//   );

//   /* ================= MAIN RENDER ================= */

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Đang tải dữ liệu...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* HEADER */}
//       <LinearGradient
//         colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
//         style={styles.header}
//       >
//         <Text style={styles.headerTitle}>Quản lý gói dịch vụ</Text>
//       </LinearGradient>

//       {/* FILTER & SEARCH */}
//       <View style={styles.filterSection}>
//           <View style={styles.searchContainer}>
//             <Ionicons name="search" size={20} color="#999" style={{marginRight: 8}}/>
//             <TextInput
//             style={styles.searchInput}
//             placeholder="Tìm kiếm tên gói..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             />
//             <Pressable style={styles.addButton} onPress={openCreateModal}>
//             <Ionicons name="add" size={24} color="#FFF" />
//             </Pressable>
//         </View>
//         {renderStatusTabs()}
//       </View>

//       {/* LIST */}
//       <ScrollView
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {filteredPackages.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Ionicons name="cube-outline" size={64} color="#DDD" />
//             <Text style={{color: '#999', marginTop: 12}}>Không tìm thấy gói dịch vụ nào</Text>
//           </View>
//         ) : (
//           filteredPackages.map(renderPackageItem)
//         )}
//       </ScrollView>

//       {/* ================= MODAL CREATE (Giữ nguyên logic cũ) ================= */}
//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <Pressable
//           style={styles.modalOverlay}
//           onPress={() => setModalVisible(false)}
//         >
//           <Pressable style={styles.modalContent}>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <Text style={styles.modalTitle}>Tạo gói mới</Text>

//               <TextInput
//                 style={styles.input}
//                 placeholder="Tên gói *"
//                 value={formData.name}
//                 onChangeText={(v) => setFormData({ ...formData, name: v })}
//               />

//               <TextInput
//                 style={styles.input}
//                 placeholder="Mô tả"
//                 value={formData.description}
//                 onChangeText={(v) =>
//                   setFormData({ ...formData, description: v })
//                 }
//               />

//               <TextInput
//                 style={styles.input}
//                 placeholder="Giá (VNĐ) *"
//                 keyboardType="numeric"
//                 value={formData.price}
//                 onChangeText={(v) => setFormData({ ...formData, price: v })}
//               />

//               {/* DURATION */}
//               <View style={{ flexDirection: "row", gap: 8 }}>
//                 <TextInput
//                   style={[styles.input, { flex: 1 }]}
//                   placeholder="Thời hạn *"
//                   keyboardType="numeric"
//                   value={formData.duration_value}
//                   onChangeText={(v) =>
//                     setFormData({ ...formData, duration_value: v })
//                   }
//                 />

//                 <View style={[styles.pickerWrapper, { flex: 1 }]}>
//                   <Picker
//                     selectedValue={formData.duration_unit}
//                     onValueChange={(value) =>
//                       setFormData({
//                         ...formData,
//                         duration_unit: value as DurationUnit,
//                       })
//                     }
//                   >
//                     {DURATION_UNITS.map((u) => (
//                       <Picker.Item key={u} label={u} value={u} />
//                     ))}
//                   </Picker>
//                 </View>
//               </View>

//               {/* CATEGORY */}
//               <View style={styles.pickerWrapper}>
//                 <Picker
//                   selectedValue={formData.category_id}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, category_id: String(value) })
//                   }
//                 >
//                   <Picker.Item label="-- Chọn danh mục * --" value="" />
//                   {categories.map((c) => (
//                     <Picker.Item key={c.id} label={c.name} value={c.id} />
//                   ))}
//                 </Picker>
//               </View>

//               <TextInput
//                 style={styles.input}
//                 placeholder="Features (cách nhau bởi dấu phẩy)"
//                 value={formData.features}
//                 onChangeText={(v) =>
//                   setFormData({ ...formData, features: v })
//                 }
//               />

//                <TextInput
//                 style={styles.input}
//                 placeholder="Link ảnh (URL)"
//                 value={formData.image}
//                 onChangeText={(v) =>
//                   setFormData({ ...formData, image: v })
//                 }
//               />

//               <Pressable style={styles.submitButton} onPress={handleSubmit}>
//                 <Text style={styles.submitText}>Tạo gói</Text>
//               </Pressable>
//             </ScrollView>
//           </Pressable>
//         </Pressable>
//       </Modal>
//     </View>
//   );
// }

// /* ================= STYLE ================= */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F6FA" },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

//   header: { padding: 20, paddingTop: 40, paddingBottom: 20 },
//   headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFF" },

//   filterSection: {
//       backgroundColor: '#FFF',
//       paddingBottom: 12,
//       borderBottomLeftRadius: 20,
//       borderBottomRightRadius: 20,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.05,
//       shadowRadius: 10,
//       elevation: 3,
//       zIndex: 10,
//   },

//   searchContainer: { flexDirection: "row", padding: 16, gap: 8, alignItems: 'center' },
//   searchInput: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     height: 44,
//   },

//   addButton: {
//     width: 44,
//     height: 44,
//     backgroundColor: AppTheme.colors.primary,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   tabContainer: {
//       flexDirection: 'row',
//       paddingHorizontal: 16,
//       gap: 12,
//   },
//   tabItem: {
//       paddingVertical: 6,
//       paddingHorizontal: 12,
//       borderRadius: 20,
//       backgroundColor: '#F0F0F0',
//   },
//   tabItemActive: {
//       backgroundColor: AppTheme.colors.primary,
//   },
//   tabText: {
//       fontSize: 13,
//       fontWeight: '500',
//       color: '#666',
//   },
//   tabTextActive: {
//       color: '#FFF',
//       fontWeight: '600'
//   },

//   listContent: { padding: 16 },
  
//   // CARD STYLES
//   card: {
//       backgroundColor: '#FFF',
//       borderRadius: 16,
//       padding: 16,
//       marginBottom: 16,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.05,
//       shadowRadius: 8,
//       elevation: 2,
//   },
//   cardHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'flex-start',
//       marginBottom: 8,
//   },
//   cardCategory: {
//       fontSize: 12,
//       color: '#888',
//       marginBottom: 4,
//       textTransform: 'uppercase',
//   },
//   cardTitle: {
//       fontSize: 16,
//       fontWeight: '700',
//       color: '#333',
//   },
//   statusBadge: {
//       paddingHorizontal: 8,
//       paddingVertical: 4,
//       borderRadius: 6,
//   },
//   statusText: {
//       fontSize: 10,
//       fontWeight: '700',
//       textTransform: 'uppercase',
//   },
//   cardBody: {
//       marginBottom: 12,
//   },
//   cardPrice: {
//       fontSize: 18,
//       fontWeight: '700',
//       color: AppTheme.colors.primary,
//   },
//   cardDuration: {
//       fontSize: 14,
//       fontWeight: '400',
//       color: '#666',
//   },
//   cardDescription: {
//       fontSize: 14,
//       color: '#555',
//       marginTop: 4,
//       lineHeight: 20,
//   },
//   cardFooter: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       borderTopWidth: 1,
//       borderTopColor: '#F0F0F0',
//       paddingTop: 12,
//   },
//   statItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 4,
//   },
//   statText: { fontSize: 12, color: '#666' },
//   dateText: { fontSize: 12, color: '#999' },

//   emptyState: { alignItems: "center", padding: 40 },

//   // MODAL STYLES (Keep original largely)
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#FFF",
//     padding: 20,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: "90%",
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 20,
//     textAlign: 'center'
//   },
//   input: {
//     backgroundColor: "#F5F6FA",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E0E0E0'
//   },
//   pickerWrapper: {
//     backgroundColor: "#F5F6FA",
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     justifyContent: "center",
//   },
//   submitButton: {
//     backgroundColor: AppTheme.colors.primary,
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 16,
//     shadowColor: AppTheme.colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 4,
//   },
//   submitText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
// });