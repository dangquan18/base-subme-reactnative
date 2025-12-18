import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

// ⚠️ Android Emulator: dùng 10.0.2.2 thay vì localhost
const API_URL = 'http://localhost:3000/packages/admin/all';

const AdminPackagesScreen = () => {
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ===== FORMAT TIỀN =====
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  // ===== FETCH API =====
  const fetchPackages = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token');
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        setPlans(json.plans || []);
      } else {
        Alert.alert('Lỗi', json.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      Alert.alert('Lỗi mạng', 'Không kết nối được server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPackages();
  }, []);

  // ===== STATUS BADGE =====
  const StatusBadge = ({ status }: { status: string }) => {
    let bg = '#e0e0e0';
    let color = '#757575';
    let label = status;

    if (status === 'approved' || status === 'active') {
      bg = '#e8f5e9';
      color = '#2e7d32';
      label = 'Đã duyệt';
    } else if (status === 'pending') {
      bg = '#fff3e0';
      color = '#ef6c00';
      label = 'Chờ duyệt';
    } else if (status === 'rejected') {
      bg = '#ffebee';
      color = '#c62828';
      label = 'Từ chối';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>
    );
  };

  // ===== RENDER ITEM =====
  const renderItem = ({ item }: any) => {
    const displayImage = item.imageUrl
      ? { uri: item.imageUrl }
      : { uri: 'https://placehold.co/600x400?text=No-image' };

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(admin)/plan/[id]',
            params: { id: item.id },
          })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.9 },
        ]}
      >
        {/* IMAGE */}
       

        {/* CONTENT */}
        <View style={styles.cardContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.categoryText}>
              {item.category?.name || 'Chưa phân loại'}
            </Text>

            <View style={styles.statusContainer}>
            <StatusBadge status={item.status} />
          </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.vendorText}>
            Bán bởi:{' '}
            <Text style={styles.vendorName}>
              {item.vendor?.name || 'N/A'}
            </Text>
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.price}>
            {formatCurrency(item.price)}
            <Text style={styles.unit}>
              {' '}
              / {item.duration_value} {item.duration_unit}
            </Text>
          </Text>
        </View>
      </Pressable>
    );
  };

  // ===== RENDER =====
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Các gói đã đăng bán</Text>
        <Text style={styles.headerSubtitle}>
          Tổng cộng: {plans.length} gói
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>Chưa có gói nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminPackagesScreen;

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { marginTop: 4, color: '#666' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listContent: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },

  imageContainer: { height: 150 },
  cardImage: { width: '100%', height: '100%' },

  statusContainer: { position: 'absolute', top: 10, right: 10 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  cardContent: { padding: 16 },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  categoryText: { fontSize: 12, color: '#007bff', fontWeight: '600' },

  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  starIcon: { marginRight: 4 },
  ratingText: { fontWeight: 'bold' },

  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },

  vendorText: { fontSize: 13, color: '#777' },
  vendorName: { fontWeight: '600', color: '#333' },

  description: { marginVertical: 8, color: '#666' },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },

  price: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f' },
  unit: { fontSize: 14, color: '#777' },
});
