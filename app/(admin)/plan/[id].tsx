import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

// CẤU HÌNH API
// Lưu ý: Nếu chạy Android Emulator hãy đổi localhost thành 10.0.2.2
const BASE_URL = 'http://localhost:3000'; 

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams(); // Lấy ID từ URL
  const router = useRouter();
  const { signOut } = useAuth();

  // State quản lý dữ liệu và giao diện
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý việc duyệt gói
  const [modalVisible, setModalVisible] = useState(false);
  const [approveReason, setApproveReason] = useState('Plan meets quality standards'); // Mặc định theo yêu cầu
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. HÀM GỌI API LẤY CHI TIẾT ---
  const fetchPlanDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Lỗi', 'Chưa đăng nhập (Thiếu token)');
        return;
      }

      console.log(`Fetching details for ID: ${id}`);
      const response = await fetch(`${BASE_URL}/packages/admin/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setPlan(data);
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể tải chi tiết gói');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi mạng', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlanDetails();
    }
  }, [id]);

  // --- 2. HÀM GỌI API DUYỆT GÓI (PATCH) ---
  const handleApprovePackage = async () => {
    if (!approveReason.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do duyệt');
      return;
    }

    setIsProcessing(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/packages/admin/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'approved',
          reason: approveReason
        }),
      });

      // Kiểm tra status code hoặc data trả về (tuỳ backend)
      // Giả sử backend trả về 200/201 là thành công
      if (response.ok) {
        Alert.alert('Thành công', 'Đã duyệt gói dịch vụ này!', [
          { text: 'OK', onPress: () => {
              setModalVisible(false);
              fetchPlanDetails(); // Tải lại dữ liệu để cập nhật UI
          }}
        ]);
      } else {
        const errData = await response.json();
        Alert.alert('Thất bại', errData.message || 'Có lỗi xảy ra khi duyệt');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi kết nối server khi duyệt gói');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- RENDER ---
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin gói...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centerContainer}>
        <Text>Không tìm thấy dữ liệu gói dịch vụ.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: 'blue' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPending = plan.status === 'pending';

  const handleSignOut = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/welcome");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header với Gradient */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết gói</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
        
      <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* HEADER IMAGE */}
          <Image 
            source={{ uri: plan.imageUrl || 'https://placehold.co/600x400?text=No-image' }} 
            style={styles.headerImage} 
          />

          {/* MAIN INFO CARD */}
          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <View style={styles.badgeContainer}>
                <Text style={styles.categoryBadge}>{plan.category?.name}</Text>
              </View>
              <View style={[styles.statusBadge, 
                { backgroundColor: plan.status === 'approved' ? '#E8F5E9' : '#FFF3E0' }
              ]}>
                <Text style={[styles.statusText, 
                  { color: plan.status === 'approved' ? '#2E7D32' : '#E65100' }
                ]}>
                  {plan.status === 'approved' ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                </Text>
              </View>
            </View>

            <Text style={styles.planName}>{plan.name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(plan.price)}</Text>
              <Text style={styles.duration}> / {plan.duration_value} {plan.duration_unit}</Text>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{plan.description}</Text>
            
            <Text style={styles.dateText}>Ngày tạo: {formatDate(plan.createdAt)}</Text>
          </View>

          {/* VENDOR INFO CARD */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thông tin nhà cung cấp</Text>
            <View style={styles.vendorRow}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{plan.vendor?.name?.charAt(0) || 'V'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vendorName}>{plan.vendor?.name}</Text>
                <Text style={styles.vendorContact}>{plan.vendor?.email}</Text>
                <Text style={styles.vendorContact}>{plan.vendor?.phone}</Text>
              </View>
            </View>
          </View>

           {/* STATS CARD */}
           <View style={styles.sectionCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.subscriber_count}</Text>
                <Text style={styles.statLabel}>Đăng ký</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.average_rating} ⭐</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
            </View>
          </View>

          {/* Padding bottom for button */}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* BOTTOM ACTION BAR */}
        {isPending && (
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.approveButton} 
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.approveButtonText}>Duyệt gói này</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* MODAL APPROVE */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận duyệt</Text>
            <Text style={styles.modalSubtitle}>Gói: {plan.name}</Text>
            
            <Text style={styles.label}>Lý do / Ghi chú:</Text>
            <TextInput 
              style={styles.input}
              value={approveReason}
              onChangeText={setApproveReason}
              multiline
              placeholder="Nhập lý do duyệt..."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.btn, styles.btnCancel]} 
                onPress={() => setModalVisible(false)}
                disabled={isProcessing}
              >
                <Text style={styles.btnTextCancel}>Huỷ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btn, styles.btnConfirm]} 
                onPress={handleApprovePackage}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnTextConfirm}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    maxWidth: '60%',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadge: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  duration: {
    fontSize: 14,
    color: '#757575',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF7043',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  vendorContact: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
  },
  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: '#EEE',
  },
  // BOTTOM BAR
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  approveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  btnConfirm: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  btnTextCancel: {
    color: '#333',
    fontWeight: '600',
  },
  btnTextConfirm: {
    color: '#fff',
    fontWeight: '600',
  },
});