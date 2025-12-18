import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

// --- Type Definitions (Dựa trên JSON response) ---
interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_unit: string;
  duration_value: number;
  is_active: number;
  subscriber_count: number;
  average_rating: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

interface VendorDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  status: string; // 'active', etc.
  createdAt: string;
  plans: Plan[];
  totalSubscribers: number;
  totalRevenue: number;
  totalPlans: number;
}

// --- Helper Functions ---
const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const { width } = Dimensions.get('window');

// --- Main Component ---
export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { signOut } = useAuth();
  
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        router.replace('/vendors'); // Điều hướng về login nếu cần
        return;
      }

      // LƯU Ý: Nếu chạy Android Emulator hãy đổi localhost thành 10.0.2.2
      // Nếu chạy máy thật hãy đổi thành IP LAN (ví dụ 192.168.1.5)
      const response = await fetch(`http://localhost:3000/vendor/admin/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVendor(data);

    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin Vendor. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

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

  // --- Render Sections ---

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
          <Ionicons name="people" size={20} color="#1565c0" />
        </View>
        <Text style={styles.statValue}>{vendor?.totalSubscribers}</Text>
        <Text style={styles.statLabel}>Subscribers</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
          <Ionicons name="cash" size={20} color="#2e7d32" />
        </View>
        <Text style={styles.statValue}>
            {vendor?.totalRevenue ? (vendor.totalRevenue / 1000000).toFixed(1) + 'M' : '0'}
        </Text>
        <Text style={styles.statLabel}>Doanh thu</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
          <Ionicons name="layers" size={20} color="#ef6c00" />
        </View>
        <Text style={styles.statValue}>{vendor?.totalPlans}</Text>
        <Text style={styles.statLabel}>Gói dịch vụ</Text>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={20} color="#666" />
        <Text style={styles.infoText}>{vendor?.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={20} color="#666" />
        <Text style={styles.infoText}>{vendor?.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={20} color="#666" />
        <Text style={styles.infoText}>{vendor?.address}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.descriptionLabel}>Mô tả:</Text>
      <Text style={styles.descriptionText}>{vendor?.description}</Text>
    </View>
  );

  const renderPlanItem = (plan: Plan) => (
    <View key={plan.id} style={styles.planCard}>
      <Image 
        source={{ uri: plan.imageUrl }} 
        style={styles.planImage} 
        resizeMode="cover"
      />
      <View style={styles.planContent}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: plan.status === 'approved' ? '#e8f5e9' : '#ffebee' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: plan.status === 'approved' ? '#2e7d32' : '#c62828' }
            ]}>
              {plan.status === 'approved' ? 'Đã duyệt' : plan.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.planPrice}>
          {formatCurrency(plan.price)} <Text style={styles.duration}>/ {plan.duration_value} {plan.duration_unit}</Text>
        </Text>
        
        <Text style={styles.planDesc} numberOfLines={2}>{plan.description}</Text>
        
        <View style={styles.planFooter}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{plan.average_rating}</Text>
          </View>
          <Text style={styles.planSubscribers}>{plan.subscriber_count} người đăng ký</Text>
        </View>
      </View>
    </View>
  );

  // --- Loading State ---
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // --- Empty/Error State ---
  if (!vendor) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={{ marginTop: 10, color: '#666' }}>Không tìm thấy Vendor</Text>
        <TouchableOpacity onPress={fetchVendorDetails} style={styles.retryButton}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle} numberOfLines={1}>{vendor.name}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Status */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{vendor.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            <Text style={styles.dateText}>Tham gia: {formatDate(vendor.createdAt)}</Text>
            <View style={[
              styles.statusChip, 
              { backgroundColor: vendor.status === 'active' ? '#e8f5e9' : '#ffebee' }
            ]}>
              <Text style={[
                styles.statusChipText,
                { color: vendor.status === 'active' ? '#2e7d32' : '#c62828' }
              ]}>
                {vendor.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Dashboard Stats */}
        {renderStats()}

        {/* Detailed Info */}
        {renderInfo()}

        {/* Plans List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Danh sách gói cước ({vendor.plans.length})</Text>
          {vendor.plans.length > 0 ? (
            vendor.plans.map(renderPlanItem)
          ) : (
            <Text style={styles.emptyText}>Chưa có gói cước nào.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContent: {
    padding: 16,
  },
  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  // Info Section
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#444',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Plans
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  planImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  planContent: {
    padding: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'normal',
  },
  planDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  planSubscribers: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  }
});