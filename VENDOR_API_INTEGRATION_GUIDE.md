# Hướng dẫn Ghép API cho Vendor Portal

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Chuẩn bị](#chuẩn-bị)
3. [Cấu trúc Service](#cấu-trúc-service)
4. [Ghép API cho từng màn hình](#ghép-api-cho-từng-màn-hình)
5. [Xử lý lỗi và Loading](#xử-lý-lỗi-và-loading)
6. [Best Practices](#best-practices)

---

## 🎯 Tổng quan

Vendor Portal đã được xây dựng đầy đủ với **mock data** sẵn sàng để ghép API thật. Tất cả các màn hình đều có:
- ✅ UI hoàn chỉnh với gradient headers
- ✅ State management với React hooks
- ✅ Loading states và error handling
- ✅ Pull-to-refresh functionality
- ✅ Form validation

## 🔧 Chuẩn bị

### 1. Kiểm tra Service Layer
File `services/vendor.service.ts` đã có sẵn các methods:

```typescript
// services/vendor.service.ts
import { apiClient } from './api';

export interface VendorStats {
  totalRevenue: number;
  newOrders: number;
  activePackages: number;
  averageRating: number;
}

export interface VendorPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  subscribers: number;
}

export interface VendorOrder {
  id: number;
  customerName: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string;
}

class VendorService {
  async getStats(): Promise<VendorStats> {
    const response = await apiClient.get('/vendor/stats');
    return response.data;
  }

  async getPackages(): Promise<VendorPackage[]> {
    const response = await apiClient.get('/vendor/packages');
    return response.data;
  }

  async createPackage(data: Partial<VendorPackage>): Promise<VendorPackage> {
    const response = await apiClient.post('/vendor/packages', data);
    return response.data;
  }

  async updatePackage(id: number, data: Partial<VendorPackage>): Promise<VendorPackage> {
    const response = await apiClient.patch(`/vendor/packages/${id}`, data);
    return response.data;
  }

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/vendor/packages/${id}`);
  }

  async getOrders(): Promise<VendorOrder[]> {
    const response = await apiClient.get('/vendor/orders');
    return response.data;
  }

  async updateOrderStatus(id: number, status: string): Promise<VendorOrder> {
    const response = await apiClient.patch(`/vendor/orders/${id}/status`, { status });
    return response.data;
  }
}

export const vendorService = new VendorService();
```

### 2. Kiểm tra API Client
File `services/api.ts` đã cấu hình base URL và authentication:

```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // ⚠️ Thay bằng URL backend thật
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động thêm JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      await AsyncStorage.removeItem('token');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);
```

---

## 📱 Ghép API cho từng màn hình

### 1. Dashboard (app/(vendor)/index.tsx)

#### Tìm dòng code này:
```typescript
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    // TODO: Ghép API thật
    // const statsData = await vendorService.getStats();
    // const ordersData = await vendorService.getOrders();
    
    // Mock data for now
    const mockStats: VendorStats = { ... };
```

#### Thay bằng:
```typescript
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // ✅ Gọi API thật
    const [statsData, ordersData] = await Promise.all([
      vendorService.getStats(),
      vendorService.getOrders(),
    ]);
    
    // Transform data nếu cần
    const transformedStats: VendorStats = {
      totalRevenue: statsData.totalRevenue,
      newOrders: statsData.newOrders,
      activePackages: statsData.activePackages,
      totalSubscribers: statsData.totalSubscribers || 0,
      averageRating: statsData.averageRating,
      revenueThisMonth: statsData.revenueThisMonth,
      revenueLastMonth: statsData.revenueLastMonth,
      growthRate: statsData.growthRate,
      topPackages: statsData.topPackages || [],
    };
    
    setStats(transformedStats);
    
    // Lấy 3 đơn hàng gần nhất
    const recentOrders = ordersData.slice(0, 3);
    setRecentOrders(recentOrders);
    
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    Alert.alert("Lỗi", "Không thể tải dữ liệu dashboard");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

#### Expected API Response Format:
```json
// GET /vendor/stats
{
  "totalRevenue": 45500000,
  "newOrders": 28,
  "activePackages": 12,
  "totalSubscribers": 245,
  "averageRating": 4.8,
  "revenueThisMonth": 15200000,
  "revenueLastMonth": 12800000,
  "growthRate": 18.75,
  "topPackages": [
    {
      "id": 1,
      "name": "Gói Cà Phê Premium",
      "subscribers": 85,
      "revenue": 8500000
    }
  ]
}
```

---

### 2. Packages Screen (app/(vendor)/packages.tsx)

#### A. Fetch Packages
Tìm:
```typescript
const fetchPackages = async () => {
  try {
    setLoading(true);
    // TODO: Ghép API thật
    // const data = await vendorService.getPackages();
```

Thay bằng:
```typescript
const fetchPackages = async () => {
  try {
    setLoading(true);
    
    // ✅ Gọi API thật
    const data = await vendorService.getPackages();
    
    // Transform nếu API response khác format
    const transformedPackages: VendorPackage[] = data.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      status: pkg.status,
      subscribers: pkg.subscribers || 0,
      category: pkg.category || "",
      features: pkg.features || [],
    }));
    
    setPackages(transformedPackages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    Alert.alert("Lỗi", "Không thể tải danh sách gói dịch vụ");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

#### B. Create/Update Package
Tìm:
```typescript
const handleSubmit = async () => {
  // ...validation...
  
  if (selectedPackage) {
    // TODO: Ghép API thật
    // await vendorService.updatePackage(selectedPackage.id, packageData);
```

Thay bằng:
```typescript
const handleSubmit = async () => {
  if (!formData.name || !formData.price || !formData.duration) {
    Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
    return;
  }

  try {
    const packageData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category,
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
    };

    if (selectedPackage) {
      // ✅ Update package
      const updatedPackage = await vendorService.updatePackage(
        selectedPackage.id,
        packageData
      );
      
      setPackages(
        packages.map((pkg) =>
          pkg.id === selectedPackage.id ? { ...pkg, ...updatedPackage } : pkg
        )
      );
      Alert.alert("Thành công", "Đã cập nhật gói dịch vụ");
    } else {
      // ✅ Create new package
      const newPackage = await vendorService.createPackage(packageData);
      
      setPackages([newPackage, ...packages]);
      Alert.alert("Thành công", "Đã tạo gói dịch vụ mới");
    }

    setModalVisible(false);
  } catch (error: any) {
    console.error("Error submitting package:", error);
    const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi lưu gói dịch vụ";
    Alert.alert("Lỗi", errorMessage);
  }
};
```

#### C. Delete Package
Tìm:
```typescript
const handleDeletePackage = (id: number) => {
  Alert.alert(..., [
    ...,
    {
      text: "Xóa",
      onPress: async () => {
        try {
          // TODO: Ghép API thật
          // await vendorService.deletePackage(id);
```

Thay bằng:
```typescript
const handleDeletePackage = (id: number) => {
  Alert.alert(
    "Xác nhận xóa",
    "Bạn có chắc muốn xóa gói dịch vụ này?",
    [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            // ✅ Delete package
            await vendorService.deletePackage(id);
            
            setPackages(packages.filter((pkg) => pkg.id !== id));
            Alert.alert("Thành công", "Đã xóa gói dịch vụ");
          } catch (error: any) {
            console.error("Error deleting package:", error);
            const errorMessage = error.response?.data?.message || "Không thể xóa gói dịch vụ";
            Alert.alert("Lỗi", errorMessage);
          }
        },
      },
    ]
  );
};
```

#### Expected API Endpoints:
```
GET    /vendor/packages           - List all packages
POST   /vendor/packages           - Create package
PATCH  /vendor/packages/:id       - Update package
DELETE /vendor/packages/:id       - Delete package
```

---

### 3. Orders Screen (app/(vendor)/orders.tsx)

#### A. Fetch Orders
Tìm:
```typescript
const fetchOrders = async () => {
  try {
    setLoading(true);
    // TODO: Ghép API thật
    // const data = await vendorService.getOrders();
```

Thay bằng:
```typescript
const fetchOrders = async () => {
  try {
    setLoading(true);
    
    // ✅ Gọi API thật
    const data = await vendorService.getOrders();
    
    // Transform data
    const transformedOrders: VendorOrder[] = data.map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      packageName: order.packageName,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      startDate: order.startDate,
      endDate: order.endDate,
      paymentMethod: order.paymentMethod,
    }));
    
    setOrders(transformedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

#### B. Update Order Status
Tìm:
```typescript
const handleUpdateStatus = (orderId: number, newStatus: VendorOrder["status"]) => {
  Alert.alert(..., [
    ...,
    {
      text: "Xác nhận",
      onPress: async () => {
        try {
          // TODO: Ghép API thật
          // await vendorService.updateOrderStatus(orderId, newStatus);
```

Thay bằng:
```typescript
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
            // ✅ Update status
            const updatedOrder = await vendorService.updateOrderStatus(orderId, newStatus);
            
            setOrders(
              orders.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
              )
            );
            Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
          } catch (error: any) {
            console.error("Error updating order status:", error);
            const errorMessage = error.response?.data?.message || "Không thể cập nhật trạng thái";
            Alert.alert("Lỗi", errorMessage);
          }
        },
      },
    ]
  );
};
```

#### Expected API Endpoints:
```
GET   /vendor/orders              - List all orders
PATCH /vendor/orders/:id/status   - Update order status
```

---

## ⚠️ Xử lý Lỗi và Loading

### 1. Error Handling Pattern
```typescript
try {
  setLoading(true);
  const data = await vendorService.someMethod();
  // Process success
} catch (error: any) {
  console.error("Error context:", error);
  
  // Parse error message
  let errorMessage = "Đã xảy ra lỗi";
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  // Show user-friendly error
  Alert.alert("Lỗi", errorMessage);
} finally {
  setLoading(false);
  setRefreshing(false);
}
```

### 2. Network Error Detection
```typescript
if (error.message === 'Network Error') {
  Alert.alert(
    "Lỗi kết nối",
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  );
}
```

### 3. Loading States
Tất cả màn hình đã có loading state:
```typescript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      <Text style={styles.loadingText}>Đang tải...</Text>
    </View>
  );
}
```

---

## 🎯 Best Practices

### 1. Sử dụng Custom Hooks (Optional)
Tạo file `hooks/useVendorStats.ts`:
```typescript
import { useState, useEffect } from 'react';
import { vendorService, VendorStats } from '@/services/vendor.service';

export function useVendorStats() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
```

Sử dụng trong component:
```typescript
const { stats, loading, error, refetch } = useVendorStats();

if (loading) return <LoadingView />;
if (error) return <ErrorView message={error} onRetry={refetch} />;
```

### 2. Optimistic Updates
Cập nhật UI trước, sau đó gọi API:
```typescript
const handleDeletePackage = async (id: number) => {
  // Optimistic update
  const previousPackages = packages;
  setPackages(packages.filter(pkg => pkg.id !== id));
  
  try {
    await vendorService.deletePackage(id);
    Alert.alert("Thành công", "Đã xóa gói dịch vụ");
  } catch (error) {
    // Rollback on error
    setPackages(previousPackages);
    Alert.alert("Lỗi", "Không thể xóa gói dịch vụ");
  }
};
```

### 3. Debounce Search
```typescript
import { useEffect, useState } from 'react';

const [searchQuery, setSearchQuery] = useState("");
const [debouncedQuery, setDebouncedQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 500);

  return () => clearTimeout(timer);
}, [searchQuery]);

useEffect(() => {
  if (debouncedQuery) {
    // Perform search
  }
}, [debouncedQuery]);
```

### 4. Pagination (Optional)
```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const fetchMoreOrders = async () => {
  if (!hasMore) return;
  
  try {
    const newOrders = await vendorService.getOrders({ page: page + 1 });
    if (newOrders.length > 0) {
      setOrders([...orders, ...newOrders]);
      setPage(page + 1);
    } else {
      setHasMore(false);
    }
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🧪 Testing API Integration

### 1. Test với Postman/Thunder Client
```bash
# Get vendor stats
GET http://localhost:3000/vendor/stats
Authorization: Bearer YOUR_JWT_TOKEN

# Create package
POST http://localhost:3000/vendor/packages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Gói Test",
  "description": "Test description",
  "price": 299000,
  "duration": 30,
  "category": "Test"
}
```

### 2. Console Logging
Thêm logging để debug:
```typescript
const fetchPackages = async () => {
  console.log("[VendorPackages] Fetching packages...");
  try {
    const data = await vendorService.getPackages();
    console.log("[VendorPackages] Received data:", data);
    setPackages(data);
  } catch (error) {
    console.error("[VendorPackages] Error:", error);
  }
};
```

### 3. Network Inspector
- iOS: Shake device → Debug → Network
- Android: adb logcat | grep -i "axios"

---

## 📝 Checklist Ghép API

### Dashboard
- [ ] Fetch vendor stats (GET /vendor/stats)
- [ ] Fetch recent orders (GET /vendor/orders)
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Pull to refresh works

### Packages
- [ ] Fetch packages list (GET /vendor/packages)
- [ ] Create new package (POST /vendor/packages)
- [ ] Update package (PATCH /vendor/packages/:id)
- [ ] Delete package (DELETE /vendor/packages/:id)
- [ ] Search works correctly
- [ ] Filter by status works
- [ ] Form validation works

### Orders
- [ ] Fetch orders list (GET /vendor/orders)
- [ ] Update order status (PATCH /vendor/orders/:id/status)
- [ ] Search works correctly
- [ ] Filter by status works
- [ ] Status counts update correctly

### General
- [ ] JWT token được gửi trong header
- [ ] 401 errors redirect to login
- [ ] Network errors show friendly message
- [ ] All alerts show correct messages
- [ ] Loading indicators work
- [ ] Pull to refresh works on all screens

---

## 🚀 Deployment Notes

### 1. Update Base URL
Trong `services/api.ts`:
```typescript
// Development
baseURL: 'http://localhost:3000'

// Production
baseURL: 'https://api.yourapp.com'

// Staging
baseURL: 'https://staging-api.yourapp.com'
```

### 2. Environment Variables
Tạo file `.env`:
```
API_BASE_URL=https://api.yourapp.com
```

Sử dụng:
```typescript
import { API_BASE_URL } from '@env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // ...
});
```

---

## ❓ FAQ

**Q: API response format khác với frontend interface?**
A: Sử dụng transform function:
```typescript
const transformPackage = (apiData: any): VendorPackage => ({
  id: apiData.package_id,
  name: apiData.title,
  // ...map fields
});
```

**Q: Làm sao để test mà chưa có backend?**
A: Giữ nguyên mock data, comment API calls ra:
```typescript
// const data = await vendorService.getPackages();
const data = mockPackages; // Use mock data
```

**Q: Token expired trong lúc dùng app?**
A: Đã có interceptor xử lý 401 trong `services/api.ts`

---

## 📚 References

- [API Documentation](./API_DOCUMENTATION.md)
- [Axios Documentation](https://axios-http.com/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org/)

---

**Cần hỗ trợ thêm?** 
- Check logs: `console.log` và `console.error`
- Test API với Postman trước
- Verify JWT token format
- Check network connectivity

**Happy coding! 🎉**
