import { AppTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


/* ================= TYPES (Khớp với JSON bạn gửi) ================= */


interface Statistics {
  subscriptions: any[];
  totalRevenue: number;
  averageRating: string | number;
  reviewCount: number;
}


interface Category {
  id: number;
  name: string;
  description: string;
}


interface PackageDetail {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  description: string;
  price: string; // API trả về string "179000.00"
  duration_unit: string;
  duration_value: number;
  is_active: number; // API trả về 1 hoặc 0
  subscriber_count: number;
  average_rating: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  category: Category;
  statistics: Statistics;
}


/* ================= HELPER ================= */


const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
};


const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "#4CAF50"; // Xanh lá
    case "pending": return "#FF9800"; // Cam
    case "rejected": return "#F44336"; // Đỏ
    default: return "#9E9E9E";
  }
};


const getStatusLabel = (status: string) => {
  switch (status) {
    case "approved": return "Đã duyệt";
    case "pending": return "Chờ duyệt";
    case "rejected": return "Từ chối";
    default: return status;
  }
};


/* ================= COMPONENT ================= */


export default function PackageDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();


  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  // State cho Modal Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  // Form data để update
  const [editForm, setEditForm] = useState({
    price: "",
    description: "",
    is_active: true,
  });


  /* ================= FETCH DATA ================= */


  useEffect(() => {
    if (id) fetchPackageDetail();
  }, [id]);


  const fetchPackageDetail = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // Lấy thông tin package
      const res = await fetch(`http://localhost:3000/vendor/packages/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");
     
      let data: PackageDetail = await res.json();
      
      // Lấy orders để tính subscriber count thực tế
      try {
        const resOrders = await fetch("http://localhost:3000/vendor/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (resOrders.ok) {
          const ordersData = await resOrders.json();
          const orders = ordersData.orders || [];
          
          // Đếm số subscriber active cho package này
          const activeSubscribers = orders.filter((order: any) => 
            order.plan_id === Number(id) && order.status === 'active'
          ).length;
          
          console.log(`📊 Package ${id} - Active subscribers:`, activeSubscribers);
          
          // Update subscriber_count với dữ liệu thực tế
          data = {
            ...data,
            subscriber_count: activeSubscribers,
          };
        }
      } catch (orderError) {
        console.log("Warning: Could not fetch orders for subscriber count");
      }
      
      setPkg(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không tải được thông tin gói");
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchPackageDetail();
  };


  /* ================= ACTIONS ================= */


  // 1. Chuẩn bị dữ liệu cho Modal Edit
  const openEditModal = () => {
    if (!pkg) return;
    setEditForm({
      price: String(Number(pkg.price)), // Chuyển về string số nguyên (bỏ .00)
      description: pkg.description,
      is_active: pkg.is_active === 1, // Convert 1 -> true
    });
    setModalVisible(true);
  };


  // 2. Gọi API UPDATE (PATCH)
  const handleUpdate = async () => {
    if (!pkg) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        price: Number(editForm.price),
        description: editForm.description,
        is_active: editForm.is_active, // Server cần boolean hoặc 1/0 tùy backend, thường Express nhận boolean ok
      };


      const res = await fetch(`http://localhost:3000/vendor/packages/${pkg.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });


      if (!res.ok) {
         const txt = await res.text();
         throw new Error(txt);
      }


      Alert.alert("Thành công", "Đã cập nhật thông tin gói");
      setModalVisible(false);
      fetchPackageDetail(); // Load lại dữ liệu mới nhất
    } catch (error: any) {
      Alert.alert("Cập nhật thất bại", error.message || "Lỗi không xác định");
    } finally {
      setIsSubmitting(false);
    }
  };


  // 3. Gọi API DELETE
  const handleDelete = () => {
    Alert.alert(
      "Cảnh báo xóa",
      "Bạn có chắc chắn muốn xóa gói này? Nếu gói đã có người mua, bạn nên chọn 'Tạm ngưng' thay vì Xóa.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Vẫn xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const token = localStorage.getItem("auth_token");
              const res = await fetch(`http://localhost:3000/vendor/packages/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
              });


              if (!res.ok) {
                 const errorText = await res.text();
                 // Hiển thị lỗi từ server để biết tại sao không xóa được (VD: dính khóa ngoại)
                 Alert.alert("Không thể xóa", `Server phản hồi: ${errorText}`);
                 return;
              }


              Alert.alert("Thành công", "Đã xóa gói dịch vụ");
              router.back();
            } catch (error) {
              Alert.alert("Lỗi mạng", "Không kết nối được đến server");
            }
          },
        },
      ]
    );
  };


  /* ================= RENDER UI ================= */


  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }


  if (!pkg) return null;


  // Lấy thống kê an toàn
  const stats = pkg.statistics || { totalRevenue: 0, averageRating: 0, reviewCount: 0 };


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết gói dịch vụ</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>


      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* SECTION 1: INFO CARD */}
        <View style={styles.card}>
            {/* Ảnh đại diện hoặc Placeholder */}
            <View style={styles.imageContainer}>
                {pkg.imageUrl ? (
                    <Image source={{ uri: pkg.imageUrl }} style={styles.pkgImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={40} color="#CCC" />
                        <Text style={{color: '#999', fontSize: 12}}>Chưa có ảnh</Text>
                    </View>
                )}
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(pkg.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(pkg.status)}</Text>
                </View>
            </View>


            <View style={styles.cardBody}>
                <Text style={styles.categoryName}>{pkg.category?.name || "Chưa phân loại"}</Text>
                <Text style={styles.pkgName}>{pkg.name}</Text>
               
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatCurrency(pkg.price)}</Text>
                    <Text style={styles.unit}>/ {pkg.duration_value} {pkg.duration_unit}</Text>
                </View>


                <View style={styles.divider} />
               
                <Text style={styles.label}>Mô tả:</Text>
                <Text style={styles.desc}>{pkg.description}</Text>


                {/* Trạng thái Active/Inactive */}
                <View style={[styles.activeBadge, { backgroundColor: pkg.is_active ? '#E8F5E9' : '#FFEBEE'}]}>
                     <Ionicons
                        name={pkg.is_active ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={pkg.is_active ? "#2E7D32" : "#C62828"}
                     />
                     <Text style={{color: pkg.is_active ? "#2E7D32" : "#C62828", fontWeight: '600', marginLeft: 6}}>
                        {pkg.is_active ? "Đang hoạt động" : "Đang tạm ngưng"}
                     </Text>
                </View>
            </View>
        </View>


        {/* SECTION 2: STATISTICS (Dữ liệu từ key 'statistics') */}
        <Text style={styles.sectionTitle}>Hiệu quả kinh doanh</Text>
        <View style={styles.statsGrid}>
            <View style={styles.statCard}>
                <View style={[styles.iconBox, {backgroundColor: '#E3F2FD'}]}>
                    <Ionicons name="wallet" size={20} color="#2196F3" />
                </View>
                <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
                <Text style={styles.statLabel}>Doanh thu</Text>
            </View>


            <View style={styles.statCard}>
                <View style={[styles.iconBox, {backgroundColor: '#FFF3E0'}]}>
                    <Ionicons name="people" size={20} color="#FF9800" />
                </View>
                <Text style={styles.statValue}>{pkg.subscriber_count}</Text>
                <Text style={styles.statLabel}>Người đăng ký</Text>
            </View>


            <View style={styles.statCard}>
                <View style={[styles.iconBox, {backgroundColor: '#FFF8E1'}]}>
                    <Ionicons name="star" size={20} color="#FFC107" />
                </View>
                <Text style={styles.statValue}>{Number(stats.averageRating).toFixed(1)} / 5</Text>
                <Text style={styles.statLabel}>{stats.reviewCount} đánh giá</Text>
            </View>
        </View>


        {/* SECTION 3: METADATA */}
        <View style={styles.metaBox}>
            <Text style={styles.metaText}>Ngày tạo: {new Date(pkg.createdAt).toLocaleString('vi-VN')}</Text>
            <Text style={styles.metaText}>ID Gói: #{pkg.id}</Text>
        </View>


        {/* SECTION 4: ACTIONS */}
        <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.btnUpdate} onPress={openEditModal}>
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={styles.btnText}>Cập nhật thông tin</Text>
            </TouchableOpacity>


            {/* <TouchableOpacity style={styles.btnDelete} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.btnText, { color: '#FF3B30' }]}>Xóa gói</Text>
            </TouchableOpacity> */}
        </View>
      </ScrollView>


      {/* ================= MODAL EDIT ================= */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Cập nhật gói #{pkg.id}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>


                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Tên gói (Readonly để tránh đổi lung tung, tùy nghiệp vụ) */}
                    <Text style={styles.inputLabel}>Tên gói (Không đổi)</Text>
                    <TextInput style={[styles.input, {backgroundColor: '#EEE'}]} value={pkg.name} editable={false} />


                    <Text style={styles.inputLabel}>Giá bán (VNĐ)</Text>
                    <TextInput
                        style={styles.input}
                        value={editForm.price}
                        keyboardType="numeric"
                        onChangeText={(v) => setEditForm({...editForm, price: v})}
                    />


                    <Text style={styles.inputLabel}>Mô tả chi tiết</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        value={editForm.description}
                        multiline
                        onChangeText={(v) => setEditForm({...editForm, description: v})}
                    />


                    {/* Switch Is Active */}
                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.inputLabel}>Trạng thái hoạt động</Text>
                            <Text style={{fontSize: 12, color: '#888'}}>Tắt để tạm ngưng gói này</Text>
                        </View>
                        <Switch
                            value={editForm.is_active}
                            onValueChange={(v) => setEditForm({...editForm, is_active: v})}
                            trackColor={{ false: "#767577", true: AppTheme.colors.primaryLight }}
                            thumbColor={editForm.is_active ? AppTheme.colors.primary : "#f4f3f4"}
                        />
                    </View>


                    <TouchableOpacity
                        style={[styles.btnSubmit, isSubmitting && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <ActivityIndicator color="#FFF"/> : <Text style={styles.btnSubmitText}>Lưu thay đổi</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}


/* ================= STYLES ================= */


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
 
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },


  content: { padding: 16, paddingBottom: 40 },


  // Info Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  imageContainer: {
    height: 150,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  pkgImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { alignItems: 'center' },
  statusTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
 
  cardBody: { padding: 16 },
  categoryName: { fontSize: 13, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  pkgName: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 24, fontWeight: '700', color: AppTheme.colors.primary },
  unit: { fontSize: 14, color: '#666', marginLeft: 4 },
 
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
 
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  desc: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 12 },


  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },


  // Statistics
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12, marginLeft: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 2, textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center' },


  // Metadata
  metaBox: { alignItems: 'center', marginBottom: 24 },
  metaText: { fontSize: 12, color: '#AAA', marginVertical: 2 },


  // Actions
  actionContainer: { gap: 12 },
  btnUpdate: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnDelete: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },


  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 10
  },
  btnSubmit: {
    backgroundColor: AppTheme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSubmitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
