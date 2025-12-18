import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

// --- CẤU HÌNH ---
// Lưu ý: Nếu chạy Android Emulator, đổi localhost thành 10.0.2.2
const API_URLL = 'http://localhost:3000/vendor/admin/all'; 

export default function App() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- HÀM GỌI API ---
const fetchVendors = async () => {
  try {
    setLoading(true);
    console.log('Bắt đầu gọi API...');

    // 1. Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');

    if (!token) {
      Alert.alert('Lỗi', 'Không tìm thấy token, vui lòng đăng nhập lại');
      return;
    }

    // 2. Gọi API
    const response = await fetch('http://localhost:3000/vendor/admin/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 3. Set data
    if (data?.vendors) {
      setVendors(data.vendors);
    } else {
      setVendors([]);
    }

  } catch (error) {
    console.error('Lỗi fetch:', error);
    Alert.alert('Lỗi', 'Không thể tải dữ liệu. Hãy kiểm tra API hoặc Token.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchVendors();
  }, []);

  // --- HÀM UI HELPER ---
  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return '#2e7d32'; // Xanh lá đậm
      case 'approved': return '#2e7d32';
      case 'pending': return '#ed6c02'; // Cam
      default: return '#757575'; // Xám
    }
  };

  // --- RENDER MỘT ITEM (VENDOR CARD) ---
  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        {/* Header Card: Tên + Trạng thái */}
        <View style={styles.cardHeader}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>

        {/* Thông tin liên hệ */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📧 {item.email}</Text>
          <Text style={styles.infoText}>📞 {item.phone || 'Không có sđt'}</Text>
          <Text style={styles.infoText} numberOfLines={1}>
            🏠 {item.address || 'Chưa cập nhật địa chỉ'}
          </Text>
        </View>

        {/* Thống kê gói (Plans) */}
        <View style={styles.footerContainer}>
          <Text style={styles.planCountText}>
            📦 Số gói đã đăng: <Text style={{ fontWeight: 'bold' }}>{item.plans ? item.plans.length : 0}</Text>
          </Text>
          <Text style={styles.dateText}>
            Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    );
  };

  // --- RENDER MÀN HÌNH CHÍNH ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Vendor</Text>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy vendor nào.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow cho Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  planCountText: {
    fontSize: 14,
    color: '#007bff',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
});