# 📋 TÀI LIỆU API & DATABASE - DỰ ÁN SUBSCRIPTION PLATFORM

## 📊 PHÂN TÍCH DATABASE HIỆN TẠI

### **Bảng dữ liệu có sẵn:**

1. ✅ `users` - Quản lý người dùng (user/admin/vendor)
2. ✅ `vendors` - Quản lý nhà cung cấp dịch vụ
3. ✅ `categories` - Danh mục gói dịch vụ
4. ✅ `plans` - Các gói đăng ký (packages)
5. ✅ `subscriptions` - Đăng ký của người dùng
6. ✅ `payments` - Lịch sử thanh toán
7. ✅ `notifications` - Thông báo

---

## 🔧 BỔ SUNG DATABASE

### **1. Bảng `payment_methods` - Phương thức thanh toán của user**

```sql
CREATE TABLE `payment_methods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` enum('VNPay','MoMo','CreditCard','BankTransfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `card_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_brand` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_method_user` (`user_id`),
  CONSTRAINT `payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **2. Bảng `reviews` - Đánh giá gói dịch vụ**

```sql
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `plan_id` bigint NOT NULL,
  `rating` int NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_review_user` (`user_id`),
  KEY `idx_review_plan` (`plan_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **3. Bảng `favorites` - Gói yêu thích của user**

```sql
CREATE TABLE `favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `plan_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_plan` (`user_id`, `plan_id`),
  KEY `idx_favorite_user` (`user_id`),
  KEY `idx_favorite_plan` (`plan_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **4. Bảng `vendor_analytics` - Thống kê vendor**

```sql
CREATE TABLE `vendor_analytics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint NOT NULL,
  `date` date NOT NULL,
  `revenue` decimal(10,2) DEFAULT '0.00',
  `new_subscribers` int DEFAULT '0',
  `cancelled_subscribers` int DEFAULT '0',
  `total_subscribers` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vendor_date` (`vendor_id`, `date`),
  KEY `idx_analytics_vendor` (`vendor_id`),
  CONSTRAINT `vendor_analytics_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **5. Cập nhật bảng `subscriptions` - Thêm cột auto_renew**

```sql
ALTER TABLE `subscriptions`
ADD COLUMN `auto_renew` tinyint(1) DEFAULT '1' AFTER `status`,
ADD COLUMN `paused_at` datetime DEFAULT NULL AFTER `auto_renew`,
ADD COLUMN `cancelled_at` datetime DEFAULT NULL AFTER `paused_at`;
```

### **6. Cập nhật bảng `plans` - Thêm metadata**

```sql
ALTER TABLE `plans`
ADD COLUMN `features` JSON DEFAULT NULL AFTER `description`,
ADD COLUMN `subscriber_count` int DEFAULT '0' AFTER `duration_value`,
ADD COLUMN `average_rating` decimal(3,2) DEFAULT '0.00' AFTER `subscriber_count`;
```

### **7. Cập nhật bảng `notifications` - Thêm type và metadata**

```sql
ALTER TABLE `notifications`
ADD COLUMN `type` enum('delivery','payment','promotion','system','subscription')
    COLLATE utf8mb4_unicode_ci DEFAULT 'system' AFTER `user_id`,
ADD COLUMN `metadata` JSON DEFAULT NULL AFTER `message`;
```

---

## 🚀 DANH SÁCH API CẦN IMPLEMENT

### **📌 1. AUTHENTICATION APIs**

#### **POST** `/auth/register`

**Mô tả:** Đăng ký tài khoản mới

```typescript
// Request Body
{
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'vendor'; // default: 'user'
  phone?: string;
  address?: string;
  date_of_birth?: string; // format: YYYY-MM-DD
}

// Response
{
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  }
}
```

#### **POST** `/auth/login`

**Mô tả:** Đăng nhập (Đã có)

```typescript
// Request Body
{
  email: string;
  password: string;
}

// Response
{
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: "user" | "vendor" | "admin";
  }
}
```

#### **POST** `/auth/refresh`

**Mô tả:** Làm mới access token

```typescript
// Request Body
{
  refresh_token: string;
}

// Response
{
  access_token: string;
}
```

#### **POST** `/auth/logout`

**Mô tả:** Đăng xuất

```typescript
// Headers: Authorization: Bearer {token}
// Response
{
  success: boolean;
  message: string;
}
```

#### **GET** `/auth/me`

**Mô tả:** Lấy thông tin user hiện tại

```typescript
// Headers: Authorization: Bearer {token}
// Response
{
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  created_at: string;
}
```

---

### **📦 2. PACKAGES/PLANS APIs**

#### **GET** `/packages`

**Mô tả:** Lấy danh sách gói dịch vụ (có phân trang & filter)

```typescript
// Query Params
{
  category?: number;       // category_id
  search?: string;         // tìm theo tên
  limit?: number;          // default: 20
  offset?: number;         // default: 0
  status?: 'approved';     // chỉ lấy gói đã duyệt
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
}

// Response
{
  packages: [
    {
      id: number;
      vendor_id: number;
      vendor_name: string;
      category_id: number;
      category_name: string;
      name: string;
      description: string;
      features: string[]; // JSON array
      price: number;
      duration_unit: 'ngày' | 'tuần' | 'tháng' | 'năm';
      duration_value: number;
      imageUrl: string | null;
      subscriber_count: number;
      average_rating: number;
      status: string;
    }
  ];
  total: number;
  hasMore: boolean;
}
```

#### **GET** `/packages/featured`

**Mô tả:** Lấy gói nổi bật (top rating, nhiều subscriber)

```typescript
// Query Params
{
  limit?: number; // default: 10
}

// Response - Array of Package objects
```

#### **GET** `/packages/category/:categoryId`

**Mô tả:** Lấy gói theo danh mục

```typescript
// Response - Array of Package objects
```

#### **GET** `/packages/:id`

**Mô tả:** Chi tiết gói dịch vụ

```typescript
// Response
{
  id: number;
  vendor: {
    id: number;
    name: string;
    email: string;
    phone: string;
    description: string;
  };
  category: {
    id: number;
    name: string;
    description: string;
  };
  name: string;
  description: string;
  features: string[];
  price: number;
  duration_unit: string;
  duration_value: number;
  imageUrl: string | null;
  subscriber_count: number;
  average_rating: number;
  reviews: [
    {
      id: number;
      user_name: string;
      rating: number;
      comment: string;
      created_at: string;
    }
  ];
  is_favorited: boolean; // nếu user đã login
}
```

#### **GET** `/packages/search`

**Mô tả:** Tìm kiếm gói dịch vụ

```typescript
// Query Params
{
  q: string; // search query
  limit?: number;
}

// Response - Array of Package objects
```

---

### **🔖 3. SUBSCRIPTIONS APIs**

#### **GET** `/subscriptions`

**Mô tả:** Lấy danh sách đăng ký của user

```typescript
// Headers: Authorization: Bearer {token}
// Query Params
{
  status?: 'active' | 'expired' | 'cancelled' | 'pending_payment';
}

// Response
[
  {
    id: number;
    plan: {
      id: number;
      name: string;
      price: number;
      duration_unit: string;
      duration_value: number;
      imageUrl: string;
      vendor_name: string;
    };
    start_date: string;
    end_date: string;
    status: string;
    auto_renew: boolean;
    paused_at: string | null;
    cancelled_at: string | null;
    days_remaining: number; // tính toán
  }
]
```

#### **GET** `/subscriptions/:id`

**Mô tả:** Chi tiết đăng ký

```typescript
// Response - Single subscription object với đầy đủ thông tin
```

#### **POST** `/subscriptions`

**Mô tả:** Tạo đăng ký mới

```typescript
// Request Body
{
  plan_id: number;
  payment_method_id?: number; // optional nếu dùng VNPay/MoMo redirect
  auto_renew?: boolean; // default: true
}

// Response
{
  subscription: {
    id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
    status: 'pending_payment' | 'active';
  };
  payment: {
    id: number;
    amount: number;
    method: string;
    status: 'pending' | 'success';
    payment_url?: string; // URL redirect VNPay/MoMo
  };
  notification: {
    id: number;
    message: string;
  }
}
```

#### **PATCH** `/subscriptions/:id`

**Mô tả:** Cập nhật đăng ký (toggle auto_renew)

```typescript
// Request Body
{
  auto_renew?: boolean;
}

// Response - Updated subscription object
```

#### **POST** `/subscriptions/:id/pause`

**Mô tả:** Tạm dừng đăng ký

```typescript
// Response
{
  success: boolean;
  subscription: {
    id: number;
    status: "paused";
    paused_at: string;
  }
}
```

#### **POST** `/subscriptions/:id/resume`

**Mô tả:** Tiếp tục đăng ký đã tạm dừng

```typescript
// Response - Updated subscription object
```

#### **POST** `/subscriptions/:id/renew`

**Mô tả:** Gia hạn đăng ký

```typescript
// Request Body
{
  payment_method_id?: number;
}

// Response
{
  subscription: { /* updated */ };
  payment: { /* new payment */ };
}
```

#### **DELETE** `/subscriptions/:id`

**Mô tả:** Hủy đăng ký

```typescript
// Response
{
  success: boolean;
  message: string;
  subscription: {
    id: number;
    status: "cancelled";
    cancelled_at: string;
  }
}
```

---

### **💳 4. PAYMENTS APIs**

#### **GET** `/payments/history`

**Mô tả:** Lịch sử thanh toán của user

```typescript
// Headers: Authorization: Bearer {token}
// Query Params
{
  limit?: number;
  offset?: number;
  status?: 'success' | 'pending' | 'failed';
}

// Response
{
  payments: [
    {
      id: number;
      subscription: {
        id: number;
        plan_name: string;
        vendor_name: string;
      };
      amount: number;
      method: string;
      status: string;
      transaction_id: string;
      created_at: string;
    }
  ];
  total: number;
}
```

#### **GET** `/payments/:id`

**Mô tả:** Chi tiết thanh toán

```typescript
// Response - Single payment object
```

#### **POST** `/payments/process`

**Mô tả:** Xử lý thanh toán

```typescript
// Request Body
{
  subscription_id: number;
  payment_method: 'VNPay' | 'MoMo' | 'CreditCard';
  amount: number;
}

// Response
{
  payment: {
    id: number;
    status: 'pending' | 'success';
    transaction_id: string;
  };
  payment_url?: string; // Redirect URL cho VNPay/MoMo
}
```

#### **POST** `/payments/vnpay/callback`

**Mô tả:** Callback từ VNPay sau thanh toán

```typescript
// Query Params - VNPay sẽ gửi
{
  vnp_ResponseCode: string;
  vnp_TxnRef: string;
  // ... other VNPay params
}

// Response
{
  success: boolean;
  subscription_id: number;
  payment_status: string;
}
```

#### **POST** `/payments/momo/callback`

**Mô tả:** Callback từ MoMo sau thanh toán

```typescript
// Similar structure như VNPay callback
```

#### **GET** `/payments/methods`

**Mô tả:** Danh sách phương thức thanh toán của user

```typescript
// Response
[
  {
    id: number;
    type: 'VNPay' | 'MoMo' | 'CreditCard';
    card_last4: string | null;
    card_brand: string | null;
    account_number: string | null;
    is_default: boolean;
    is_active: boolean;
  }
]
```

#### **POST** `/payments/methods`

**Mô tả:** Thêm phương thức thanh toán

```typescript
// Request Body
{
  type: 'VNPay' | 'MoMo' | 'CreditCard' | 'BankTransfer';
  card_last4?: string;
  card_brand?: string;
  account_number?: string;
  account_name?: string;
  is_default?: boolean;
}

// Response - Created payment method object
```

#### **DELETE** `/payments/methods/:id`

**Mô tả:** Xóa phương thức thanh toán

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

---

### **🔔 5. NOTIFICATIONS APIs**

#### **GET** `/notifications`

**Mô tả:** Danh sách thông báo của user

```typescript
// Headers: Authorization: Bearer {token}
// Query Params
{
  is_read?: boolean;
  type?: 'delivery' | 'payment' | 'promotion' | 'system' | 'subscription';
  limit?: number;
  offset?: number;
}

// Response
{
  notifications: [
    {
      id: number;
      user_id: number;
      type: string;
      title: string;
      message: string;
      metadata: object | null;
      is_read: boolean;
      created_at: string;
    }
  ];
  total: number;
  unread_count: number;
}
```

#### **GET** `/notifications/unread-count`

**Mô tả:** Số lượng thông báo chưa đọc

```typescript
// Response
{
  count: number;
}
```

#### **PATCH** `/notifications/:id/read`

**Mô tả:** Đánh dấu đã đọc

```typescript
// Response
{
  success: boolean;
  notification: {
    /* updated */
  }
}
```

#### **PATCH** `/notifications/read-all`

**Mô tả:** Đánh dấu tất cả đã đọc

```typescript
// Response
{
  success: boolean;
  updated_count: number;
}
```

#### **DELETE** `/notifications/:id`

**Mô tả:** Xóa thông báo

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

---

### **👤 6. USER PROFILE APIs**

#### **GET** `/users/profile`

**Mô tả:** Lấy profile user hiện tại

```typescript
// Headers: Authorization: Bearer {token}
// Response
{
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  role: string;
  created_at: string;
  stats: {
    active_subscriptions: number;
    total_spent: number;
    favorite_count: number;
  }
}
```

#### **PATCH** `/users/profile`

**Mô tả:** Cập nhật profile

```typescript
// Request Body
{
  name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string; // YYYY-MM-DD
}

// Response - Updated user object
```

#### **POST** `/users/change-password`

**Mô tả:** Đổi mật khẩu

```typescript
// Request Body
{
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Response
{
  success: boolean;
  message: string;
}
```

#### **GET** `/users/favorites`

**Mô tả:** Danh sách gói yêu thích

```typescript
// Response - Array of Package objects
```

#### **POST** `/users/favorites/:planId`

**Mô tả:** Thêm vào yêu thích

```typescript
// Response
{
  success: boolean;
  favorite: {
    id: number;
    plan_id: number;
    created_at: string;
  }
}
```

#### **DELETE** `/users/favorites/:planId`

**Mô tả:** Xóa khỏi yêu thích

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

---

### **🏪 7. VENDOR APIs**

#### **GET** `/vendor/stats`

**Mô tả:** Thống kê dashboard vendor

```typescript
// Headers: Authorization: Bearer {token}
// Response
{
  totalRevenue: number;
  newOrders: number;
  activePackages: number;
  totalSubscribers: number;
  averageRating: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growthRate: number; // %
  topPackages: [
    {
      id: number;
      name: string;
      subscribers: number;
      revenue: number;
    }
  ]
}
```

#### **GET** `/vendor/packages`

**Mô tả:** Danh sách gói của vendor

```typescript
// Response
[
  {
    id: number;
    name: string;
    price: number;
    status: 'pending' | 'approved' | 'rejected';
    subscriber_count: number;
    average_rating: number;
    created_at: string;
  }
]
```

#### **POST** `/vendor/packages`

**Mô tả:** Tạo gói mới (chờ admin duyệt)

```typescript
// Request Body
{
  category_id: number;
  name: string;
  description: string;
  features?: string[]; // JSON array
  price: number;
  duration_unit: 'ngày' | 'tuần' | 'tháng' | 'năm';
  duration_value: number;
  imageUrl?: string;
}

// Response
{
  success: boolean;
  package: { /* created package */ };
  message: "Gói đã được tạo, đang chờ admin duyệt";
}
```

#### **PATCH** `/vendor/packages/:id`

**Mô tả:** Cập nhật gói

```typescript
// Request Body - Partial update
{
  name?: string;
  description?: string;
  features?: string[];
  price?: number;
  imageUrl?: string;
}

// Response - Updated package object
```

#### **DELETE** `/vendor/packages/:id`

**Mô tả:** Xóa gói (chỉ nếu chưa có ai đăng ký)

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

#### **GET** `/vendor/orders`

**Mô tả:** Danh sách đơn hàng/subscriptions của vendor

```typescript
// Query Params
{
  status?: 'pending_payment' | 'active' | 'expired' | 'cancelled';
  plan_id?: number;
  limit?: number;
  offset?: number;
}

// Response
{
  orders: [
    {
      id: number;
      user: {
        id: number;
        name: string;
        email: string;
        phone: string;
      };
      plan: {
        id: number;
        name: string;
        price: number;
      };
      start_date: string;
      end_date: string;
      status: string;
      auto_renew: boolean;
      total_paid: number; // tổng đã thanh toán
    }
  ];
  total: number;
}
```

#### **PATCH** `/vendor/orders/:id/status`

**Mô tả:** Cập nhật trạng thái đơn (nếu cần confirm thủ công)

```typescript
// Request Body
{
  status: 'confirmed' | 'delivered' | 'cancelled';
  note?: string;
}

// Response - Updated order object
```

#### **GET** `/vendor/analytics`

**Mô tả:** Thống kê chi tiết theo thời gian

```typescript
// Query Params
{
  start_date: string; // YYYY-MM-DD
  end_date: string;
}

// Response
{
  daily_stats: [
    {
      date: string;
      revenue: number;
      new_subscribers: number;
      cancelled_subscribers: number;
      total_subscribers: number;
    }
  ];
  summary: {
    total_revenue: number;
    total_new_subscribers: number;
    total_cancelled: number;
  }
}
```

#### **GET** `/vendor/reviews`

**Mô tả:** Đánh giá các gói của vendor

```typescript
// Query Params
{
  plan_id?: number;
  rating?: number; // filter by rating
  limit?: number;
}

// Response
{
  reviews: [
    {
      id: number;
      user_name: string;
      plan_name: string;
      rating: number;
      comment: string;
      created_at: string;
    }
  ];
  average_rating: number;
  total_reviews: number;
}
```

---

### **📝 8. REVIEWS APIs**

#### **GET** `/reviews/plan/:planId`

**Mô tả:** Danh sách đánh giá của gói

```typescript
// Query Params
{
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'highest' | 'lowest';
}

// Response
{
  reviews: [
    {
      id: number;
      user: {
        id: number;
        name: string;
      };
      rating: number;
      comment: string;
      created_at: string;
    }
  ];
  total: number;
  average_rating: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  }
}
```

#### **POST** `/reviews`

**Mô tả:** Tạo đánh giá (chỉ sau khi đã đăng ký gói)

```typescript
// Request Body
{
  plan_id: number;
  rating: number; // 1-5
  comment: string;
}

// Response
{
  success: boolean;
  review: {
    /* created review */
  }
}
```

#### **PATCH** `/reviews/:id`

**Mô tả:** Cập nhật đánh giá

```typescript
// Request Body
{
  rating?: number;
  comment?: string;
}

// Response - Updated review object
```

#### **DELETE** `/reviews/:id`

**Mô tả:** Xóa đánh giá

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

---

### **📂 9. CATEGORIES APIs**

#### **GET** `/categories`

**Mô tả:** Danh sách tất cả danh mục

```typescript
// Response
[
  {
    id: number;
    name: string;
    description: string;
    package_count: number; // số gói trong danh mục
    created_at: string;
  }
]
```

#### **GET** `/categories/:id`

**Mô tả:** Chi tiết danh mục

```typescript
// Response
{
  id: number;
  name: string;
  description: string;
  packages: [
    /* Array of packages in this category */
  ];
}
```

---

### **👑 10. ADMIN APIs (Optional - nếu có admin panel)**

#### **GET** `/admin/stats`

**Mô tả:** Tổng quan hệ thống

```typescript
// Response
{
  total_users: number;
  total_vendors: number;
  total_packages: number;
  total_subscriptions: number;
  total_revenue: number;
  pending_packages: number; // gói chờ duyệt
  pending_vendors: number; // vendor chờ duyệt
}
```

#### **GET** `/admin/vendors/pending`

**Mô tả:** Vendor chờ duyệt

```typescript
// Response - Array of vendors với status='pending'
```

#### **PATCH** `/admin/vendors/:id/approve`

**Mô tả:** Duyệt vendor

```typescript
// Response - Updated vendor object với status='approved'
```

#### **GET** `/admin/packages/pending`

**Mô tả:** Gói chờ duyệt

```typescript
// Response - Array of packages với status='pending'
```

#### **PATCH** `/admin/packages/:id/approve`

**Mô tả:** Duyệt gói

```typescript
// Request Body
{
  status: 'approved' | 'rejected';
  reason?: string; // nếu reject
}

// Response - Updated package object
```

---

## 🔒 AUTHENTICATION & AUTHORIZATION

### **Headers cho mọi API cần auth:**

```
Authorization: Bearer {JWT_TOKEN}
```

### **Role-based Access:**

- **user**: Chỉ truy cập `/packages/*`, `/subscriptions/*`, `/payments/*`, `/notifications/*`, `/users/*`, `/reviews/*`
- **vendor**: Truy cập `/vendor/*` + một số endpoint public
- **admin**: Truy cập tất cả + `/admin/*`

---

## 🎯 PRIORITY IMPLEMENTATION

### **Phase 1 - Core Features (Cao nhất):**

1. ✅ Auth: login, register, me
2. ✅ Packages: list, detail, featured, search
3. ✅ Subscriptions: create, list, detail, cancel
4. ✅ Payments: process, callback (VNPay/MoMo), history
5. ✅ Notifications: list, read, unread-count

### **Phase 2 - User Experience:**

6. User profile: update, change-password
7. Favorites: add, remove, list
8. Reviews: create, list
9. Payment methods: list, add, delete

### **Phase 3 - Vendor Features:**

10. Vendor stats & analytics
11. Vendor packages: CRUD
12. Vendor orders: list, update status

### **Phase 4 - Advanced:**

13. Subscription: pause, resume, renew
14. Admin panel APIs
15. Advanced filters & search

---

## 📝 LƯU Ý KHI CODE BACKEND

### **1. Validation:**

- Dùng **class-validator** hoặc **Joi** để validate request
- Validate email format, password strength, phone number
- Check foreign keys tồn tại trước khi insert

### **2. Error Handling:**

```typescript
// Chuẩn hóa error response
{
  success: false,
  error: {
    code: "INVALID_INPUT" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN",
    message: "Chi tiết lỗi",
    details?: any
  }
}
```

### **3. Pagination:**

```typescript
// Standard pagination params
{
  limit: number; // default 20, max 100
  offset: number; // default 0
}
```

### **4. Database Optimization:**

- Tạo **indexes** cho các cột hay query: `user_id`, `plan_id`, `status`, `email`
- Dùng **JOIN** thay vì N+1 query
- Cache các API read-heavy (categories, featured packages)

### **5. Security:**

- Hash password bằng **bcrypt** (cost factor: 10)
- JWT expiration: 1h (access token), 7 days (refresh token)
- Rate limiting: 100 requests/15 minutes per IP
- CORS: Chỉ allow frontend origin

### **6. Payment Integration:**

- **VNPay/MoMo**: Sử dụng webhook/callback để update payment status
- Lưu `transaction_id` để tra cứu sau
- Implement retry logic cho failed payments

### **7. Notifications:**

- Tạo notification khi:
  - Subscription created
  - Payment success/failed
  - Subscription sắp hết hạn (3 ngày trước)
  - Subscription expired
  - Promotion/discount mới

---

## 🧪 TESTING CHECKLIST

- [ ] Unit tests cho business logic
- [ ] Integration tests cho API endpoints
- [ ] Test authentication flow
- [ ] Test payment callback (mock VNPay/MoMo)
- [ ] Test subscription lifecycle (create → active → expired)
- [ ] Load testing cho high-traffic endpoints

---

## 📚 TECH STACK ĐỀ XUẤT

### **Backend Framework:**

- **NestJS** (TypeScript) - Recommended
- hoặc **Express.js** (JavaScript/TypeScript)

### **ORM:**

- **TypeORM** hoặc **Prisma** (cho TypeScript)
- **Sequelize** (nếu dùng JavaScript)

### **Authentication:**

- **Passport.js** với JWT strategy
- **bcryptjs** cho password hashing

### **Validation:**

- **class-validator** + **class-transformer** (NestJS)
- **Joi** (Express)

### **Database:**

- **MySQL 8.0** (hiện tại)

### **Caching:**

- **Redis** (cho session, cache API responses)

### **File Upload:**

- **Multer** + **AWS S3** / **Cloudinary** (cho package images)

---

## 🚀 DEPLOYMENT

### **Environment Variables:**

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=subscription_platform

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006

# Payment Gateways
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

---

## ✅ CHECKLIST HOÀN THIỆN

### **Database:**

- [ ] Tạo 4 bảng mới: payment_methods, reviews, favorites, vendor_analytics
- [ ] Alter 3 bảng: subscriptions, plans, notifications
- [ ] Tạo indexes cho performance

### **Backend APIs:**

- [ ] Authentication (5 endpoints)
- [ ] Packages (6 endpoints)
- [ ] Subscriptions (10 endpoints)
- [ ] Payments (8 endpoints)
- [ ] Notifications (5 endpoints)
- [ ] Users (6 endpoints)
- [ ] Vendors (8 endpoints)
- [ ] Reviews (4 endpoints)
- [ ] Categories (2 endpoints)

### **Integration:**

- [ ] VNPay payment gateway
- [ ] MoMo payment gateway
- [ ] Email notifications
- [ ] Push notifications (optional)

### **Testing:**

- [ ] Postman collection cho tất cả APIs
- [ ] Unit tests
- [ ] Integration tests

### **Documentation:**

- [ ] Swagger/OpenAPI docs
- [ ] README với setup instructions
- [ ] API examples

---

**Tổng số APIs cần implement: ~60+ endpoints**

Tài liệu này đủ chi tiết để bắt đầu code backend. Nếu cần thêm thông tin về bất kỳ endpoint nào, hãy hỏi!
