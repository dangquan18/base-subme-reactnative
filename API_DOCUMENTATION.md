# API Documentation - Subscription Platform

Base URL: `http://localhost:3000`

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Categories APIs](#categories-apis)
3. [Packages/Plans APIs](#packagesplans-apis)
4. [User Profile APIs](#user-profile-apis)
5. [Payment APIs](#payment-apis)
6. [Subscriptions APIs](#subscriptions-apis)
7. [Notifications APIs](#notifications-apis)
8. [Reviews APIs](#reviews-apis)
9. [Vendor APIs](#vendor-apis)

---

## Authentication APIs

### 1. Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0912345678",
  "address": "123 ABC Street, District 1, HCMC",
  "date_of_birth": "1990-01-15"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "role": "customer",
      "phone": "0912345678",
      "address": "123 ABC Street, District 1, HCMC",
      "date_of_birth": "1990-01-15T00:00:00.000Z",
      "createdAt": "2025-12-15T16:00:00.000Z",
      "updatedAt": "2025-12-15T16:00:00.000Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email đã được sử dụng",
  "error": "EMAIL_EXISTS"
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "role": "customer"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng",
  "error": "INVALID_CREDENTIALS"
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Token đã được làm mới",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "customer",
    "phone": "0912345678",
    "address": "123 ABC Street, District 1, HCMC",
    "date_of_birth": "1990-01-15T00:00:00.000Z",
    "createdAt": "2025-12-15T16:00:00.000Z",
    "updatedAt": "2025-12-15T16:00:00.000Z"
  }
}
```

---

### 5. Change Password
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "old_password": "password123",
  "new_password": "newpassword456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Mật khẩu cũ không đúng",
  "error": "INVALID_OLD_PASSWORD"
}
```

---

### 6. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## Categories APIs

### 1. Get All Categories
**GET** `/categories`

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Streaming",
    "description": "Dịch vụ xem phim, nghe nhạc trực tuyến",
    "icon": "🎬",
    "createdAt": "2025-12-15T16:00:00.000Z",
    "updatedAt": "2025-12-15T16:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Cloud Storage",
    "description": "Lưu trữ đám mây",
    "icon": "☁️",
    "createdAt": "2025-12-15T16:00:00.000Z",
    "updatedAt": "2025-12-15T16:00:00.000Z"
  }
]
```

---

### 2. Get Category Detail with Packages
**GET** `/categories/:id`

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Streaming",
  "description": "Dịch vụ xem phim, nghe nhạc trực tuyến",
  "icon": "🎬",
  "plans": [
    {
      "id": 1,
      "name": "Netflix Premium",
      "description": "Xem phim chất lượng 4K",
      "price": 260000,
      "duration_value": 1,
      "duration_unit": "tháng",
      "image": "https://example.com/netflix.jpg",
      "is_active": true,
      "subscriber_count": 1500,
      "average_rating": 4.5,
      "vendor": {
        "id": 1,
        "name": "Netflix Inc."
      }
    }
  ]
}
```

---

## Packages/Plans APIs

### 1. Get All Packages (with filters)
**GET** `/packages`

**Query Parameters:**
- `category` (optional): Category ID
- `vendor` (optional): Vendor ID
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `duration_unit` (optional): "ngày" | "tuần" | "tháng" | "năm"
- `sort` (optional): "price_asc" | "price_desc" | "popular" | "rating"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /packages?category=1&min_price=100000&max_price=500000&sort=popular&page=1&limit=10
```

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Netflix Premium",
      "description": "Xem phim chất lượng 4K, hỗ trợ 4 thiết bị cùng lúc",
      "price": 260000,
      "duration_value": 1,
      "duration_unit": "tháng",
      "features": "4K Ultra HD, 4 màn hình cùng lúc, Không quảng cáo",
      "image": "https://example.com/netflix.jpg",
      "status": "approved",
      "is_active": true,
      "subscriber_count": 1500,
      "average_rating": 4.5,
      "vendor": {
        "id": 1,
        "name": "Netflix Inc.",
        "description": "Nền tảng streaming hàng đầu thế giới"
      },
      "category": {
        "id": 1,
        "name": "Streaming"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "total_pages": 3
}
```

---

### 2. Get Featured Packages
**GET** `/packages/featured`

**Query Parameters:**
- `limit` (optional): Number of featured packages (default: 5)

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Netflix Premium",
    "description": "Xem phim chất lượng 4K",
    "price": 260000,
    "duration_value": 1,
    "duration_unit": "tháng",
    "image": "https://example.com/netflix.jpg",
    "subscriber_count": 1500,
    "average_rating": 4.5,
    "vendor": {
      "id": 1,
      "name": "Netflix Inc."
    },
    "category": {
      "id": 1,
      "name": "Streaming"
    }
  }
]
```

---

### 3. Search Packages
**GET** `/packages/search`

**Query Parameters:**
- `keyword` (required): Search keyword
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /packages/search?keyword=netflix&page=1&limit=10
```

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Netflix Premium",
      "description": "Xem phim chất lượng 4K",
      "price": 260000,
      "vendor": {
        "id": 1,
        "name": "Netflix Inc."
      }
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

---

### 4. Get Packages by Category
**GET** `/packages/category/:categoryId`

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Netflix Premium",
    "description": "Xem phim chất lượng 4K",
    "price": 260000,
    "duration_value": 1,
    "duration_unit": "tháng",
    "vendor": {
      "id": 1,
      "name": "Netflix Inc."
    }
  }
]
```

---

### 5. Get Package Detail
**GET** `/packages/:id`

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Netflix Premium",
  "description": "Xem phim chất lượng 4K, hỗ trợ 4 thiết bị cùng lúc",
  "price": 260000,
  "duration_value": 1,
  "duration_unit": "tháng",
  "features": "4K Ultra HD, 4 màn hình cùng lúc, Không quảng cáo",
  "image": "https://example.com/netflix.jpg",
  "status": "approved",
  "is_active": true,
  "subscriber_count": 1500,
  "average_rating": 4.5,
  "vendor": {
    "id": 1,
    "name": "Netflix Inc.",
    "description": "Nền tảng streaming hàng đầu thế giới",
    "logo": "https://example.com/netflix-logo.png"
  },
  "category": {
    "id": 1,
    "name": "Streaming",
    "icon": "🎬"
  },
  "createdAt": "2025-12-15T16:00:00.000Z",
  "updatedAt": "2025-12-15T16:00:00.000Z"
}
```

---

## User Profile APIs

### 1. Get Profile
**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "role": "customer",
  "phone": "0912345678",
  "address": "123 ABC Street, District 1, HCMC",
  "date_of_birth": "1990-01-15T00:00:00.000Z",
  "createdAt": "2025-12-15T16:00:00.000Z",
  "updatedAt": "2025-12-15T16:00:00.000Z"
}
```

---

### 2. Update Profile
**PATCH** `/users/profile`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "Nguyen Van A Updated",
  "phone": "0987654321",
  "address": "456 XYZ Street, District 2, HCMC",
  "date_of_birth": "1990-01-15"
}
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Nguyen Van A Updated",
  "email": "user@example.com",
  "role": "customer",
  "phone": "0987654321",
  "address": "456 XYZ Street, District 2, HCMC",
  "date_of_birth": "1990-01-15T00:00:00.000Z",
  "updatedAt": "2025-12-15T17:00:00.000Z"
}
```

---

### 3. Get Favorites
**GET** `/users/favorites`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Netflix Premium",
    "description": "Xem phim chất lượng 4K",
    "price": 260000,
    "duration_value": 1,
    "duration_unit": "tháng",
    "image": "https://example.com/netflix.jpg",
    "vendor": {
      "id": 1,
      "name": "Netflix Inc."
    },
    "category": {
      "id": 1,
      "name": "Streaming"
    }
  }
]
```

---

### 4. Add to Favorites
**POST** `/users/favorites/:planId`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã thêm vào yêu thích",
  "favorite": {
    "id": 1,
    "user_id": 1,
    "plan_id": 1,
    "createdAt": "2025-12-15T16:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "statusCode": 404,
  "message": "Gói dịch vụ không tồn tại"
}
```

**Response Error (409):**
```json
{
  "statusCode": 409,
  "message": "Gói này đã có trong danh sách yêu thích"
}
```

---

### 5. Remove from Favorites
**DELETE** `/users/favorites/:planId`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

---

## Payment APIs

### 1. Get Payment History
**GET** `/payments/history`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "amount": 260000,
      "method": "VNPay",
      "status": "success",
      "transaction_id": "TXN1702651200000",
      "createdAt": "2025-12-15T16:00:00.000Z",
      "subscription": {
        "id": 1,
        "status": "active",
        "start_date": "2025-12-15T16:00:00.000Z",
        "end_date": "2026-01-15T16:00:00.000Z",
        "plan": {
          "id": 1,
          "name": "Netflix Premium",
          "vendor": {
            "id": 1,
            "name": "Netflix Inc."
          }
        }
      }
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

### 2. Get Payment Detail
**GET** `/payments/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "amount": 260000,
  "method": "VNPay",
  "status": "success",
  "transaction_id": "TXN1702651200000",
  "createdAt": "2025-12-15T16:00:00.000Z",
  "subscription": {
    "id": 1,
    "status": "active",
    "start_date": "2025-12-15T16:00:00.000Z",
    "end_date": "2026-01-15T16:00:00.000Z",
    "plan": {
      "id": 1,
      "name": "Netflix Premium",
      "price": 260000,
      "duration_value": 1,
      "duration_unit": "tháng",
      "vendor": {
        "id": 1,
        "name": "Netflix Inc."
      }
    }
  }
}
```

---

### 3. Process Payment
**POST** `/payments/process`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "subscription_id": 1,
  "payment_method": "VNPay",
  "return_url": "http://localhost:8081/payment-result"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Payment URL generated",
  "payment": {
    "id": 1,
    "subscription_id": 1,
    "amount": 260000,
    "method": "VNPay",
    "status": "pending",
    "transaction_id": "TXN1702651200000"
  },
  "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=26000000&vnp_Command=pay&vnp_CreateDate=20251215160000&..."
}
```

**Note:** Redirect user to `payment_url` to complete payment on VNPay gateway.

---

### 4. VNPay Callback
**GET** `/payments/vnpay/callback`

**Query Parameters:** (Automatically sent by VNPay)
- `vnp_Amount`: Payment amount
- `vnp_BankCode`: Bank code
- `vnp_ResponseCode`: Response code (00 = success)
- `vnp_TransactionNo`: VNPay transaction number
- `vnp_TxnRef`: Transaction reference
- `vnp_SecureHash`: HMAC signature
- etc.

**Response Success (200):**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": {
    "payment_id": 1,
    "subscription_id": 1,
    "amount": 260000,
    "transaction_id": "TXN1702651200000",
    "vnpay_transaction": "14008622"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Thanh toán thất bại",
  "error": "PAYMENT_FAILED"
}
```

---

## Subscriptions APIs

### 1. Get User Subscriptions
**GET** `/subscriptions`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` (optional): "active" | "expired" | "cancelled" | "pending_payment"

**Response Success (200):**
```json
[
  {
    "id": 1,
    "status": "active",
    "start_date": "2025-12-15T16:00:00.000Z",
    "end_date": "2026-01-15T16:00:00.000Z",
    "auto_renew": true,
    "paused_at": null,
    "cancelled_at": null,
    "plan": {
      "id": 1,
      "name": "Netflix Premium",
      "price": 260000,
      "duration_value": 1,
      "duration_unit": "tháng",
      "image": "https://example.com/netflix.jpg",
      "vendor": {
        "id": 1,
        "name": "Netflix Inc."
      },
      "category": {
        "id": 1,
        "name": "Streaming"
      }
    }
  }
]
```

---

### 2. Get Subscription Detail
**GET** `/subscriptions/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "status": "active",
  "start_date": "2025-12-15T16:00:00.000Z",
  "end_date": "2026-01-15T16:00:00.000Z",
  "auto_renew": true,
  "paused_at": null,
  "cancelled_at": null,
  "createdAt": "2025-12-15T16:00:00.000Z",
  "updatedAt": "2025-12-15T16:00:00.000Z",
  "plan": {
    "id": 1,
    "name": "Netflix Premium",
    "description": "Xem phim chất lượng 4K",
    "price": 260000,
    "duration_value": 1,
    "duration_unit": "tháng",
    "features": "4K Ultra HD, 4 màn hình cùng lúc",
    "vendor": {
      "id": 1,
      "name": "Netflix Inc."
    },
    "category": {
      "id": 1,
      "name": "Streaming"
    }
  },
  "payments": [
    {
      "id": 1,
      "amount": 260000,
      "method": "VNPay",
      "status": "success",
      "transaction_id": "TXN1702651200000",
      "createdAt": "2025-12-15T16:00:00.000Z"
    }
  ]
}
```

---

### 3. Create Subscription
**POST** `/subscriptions`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "plan_id": 1,
  "payment_method": "VNPay",
  "auto_renew": true
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription created. Please proceed with payment.",
  "subscription": {
    "id": 1,
    "plan_id": 1,
    "status": "pending_payment",
    "amount": 260000,
    "payment_method": "VNPay"
  }
}
```

**Note:** After creating subscription, use `/payments/process` to generate payment URL.

---

### 4. Update Subscription
**PATCH** `/subscriptions/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "auto_renew": false
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription updated",
  "subscription": {
    "id": 1,
    "auto_renew": false,
    "status": "active"
  }
}
```

---

### 5. Pause Subscription
**POST** `/subscriptions/:id/pause`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription paused",
  "subscription": {
    "id": 1,
    "status": "cancelled",
    "paused_at": "2025-12-15T16:00:00.000Z"
  }
}
```

---

### 6. Resume Subscription
**POST** `/subscriptions/:id/resume`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription resumed",
  "subscription": {
    "id": 1,
    "status": "active",
    "paused_at": null
  }
}
```

---

### 7. Renew Subscription
**POST** `/subscriptions/:id/renew`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription renewed",
  "subscription": {
    "id": 1,
    "status": "active",
    "end_date": "2026-02-15T16:00:00.000Z"
  },
  "payment": {
    "id": 2,
    "amount": 260000,
    "status": "pending",
    "transaction_id": "TXN1702651200001"
  }
}
```

**Note:** After renewal, complete payment through `/payments/process` endpoint.

---

### 8. Cancel Subscription
**DELETE** `/subscriptions/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled",
  "subscription": {
    "id": 1,
    "status": "cancelled",
    "cancelled_at": "2025-12-15T16:00:00.000Z",
    "auto_renew": false
  }
}
```

---

## Notifications APIs

### 1. Get Notifications
**GET** `/notifications`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `is_read` (optional): "true" | "false"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "type": "subscription",
      "title": "Đăng ký mới",
      "message": "Bạn đã tạo đăng ký cho gói \"Netflix Premium\". Vui lòng thanh toán để kích hoạt.",
      "is_read": false,
      "createdAt": "2025-12-15T16:00:00.000Z"
    },
    {
      "id": 2,
      "type": "payment",
      "title": "Thanh toán thành công",
      "message": "Thanh toán 260,000 VNĐ cho gói Netflix Premium đã được xử lý thành công.",
      "is_read": true,
      "createdAt": "2025-12-15T15:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### 2. Get Unread Count
**GET** `/notifications/unread-count`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "count": 5
}
```

---

### 3. Mark as Read
**PATCH** `/notifications/:id/read`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã đánh dấu đã đọc"
}
```

---

### 4. Mark All as Read
**PATCH** `/notifications/read-all`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả đã đọc",
  "updated_count": 5
}
```

---

### 5. Delete Notification
**DELETE** `/notifications/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa thông báo"
}
```

---

## Reviews APIs

### 1. Get Plan Reviews
**GET** `/reviews/plan/:planId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response Success (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Dịch vụ rất tốt, chất lượng phim 4K tuyệt vời!",
      "createdAt": "2025-12-15T16:00:00.000Z",
      "user": {
        "id": 1,
        "name": "Nguyen Van A"
      }
    },
    {
      "id": 2,
      "rating": 4,
      "comment": "Giá hơi cao nhưng xứng đáng",
      "createdAt": "2025-12-14T16:00:00.000Z",
      "user": {
        "id": 2,
        "name": "Tran Thi B"
      }
    }
  ],
  "average_rating": 4.5,
  "total_reviews": 15,
  "page": 1,
  "limit": 10
}
```

---

### 2. Create Review
**POST** `/reviews`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "plan_id": 1,
  "rating": 5,
  "comment": "Dịch vụ rất tốt, chất lượng phim 4K tuyệt vời!"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đã tạo đánh giá",
  "review": {
    "id": 1,
    "user_id": 1,
    "plan_id": 1,
    "rating": 5,
    "comment": "Dịch vụ rất tốt, chất lượng phim 4K tuyệt vời!",
    "createdAt": "2025-12-15T16:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "statusCode": 400,
  "message": "Bạn phải đăng ký gói này trước khi đánh giá"
}
```

---

### 3. Update Review
**PATCH** `/reviews/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Cập nhật: Dịch vụ tốt nhưng giá hơi cao"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật đánh giá",
  "review": {
    "id": 1,
    "rating": 4,
    "comment": "Cập nhật: Dịch vụ tốt nhưng giá hơi cao",
    "updatedAt": "2025-12-15T17:00:00.000Z"
  }
}
```

---

### 4. Delete Review
**DELETE** `/reviews/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa đánh giá"
}
```

---

## Vendor APIs

**Note:** All vendor APIs require `role: 'vendor'` in JWT token.

### 1. Get Vendor Stats
**GET** `/vendor/stats`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "total_revenue": 15000000,
  "total_packages": 5,
  "total_subscribers": 150,
  "active_subscriptions": 120
}
```

---

### 2. Get Vendor Packages
**GET** `/vendor/packages`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Netflix Premium",
    "description": "Xem phim chất lượng 4K",
    "price": 260000,
    "duration_value": 1,
    "duration_unit": "tháng",
    "status": "approved",
    "is_active": true,
    "subscriber_count": 1500,
    "average_rating": 4.5,
    "createdAt": "2025-12-15T16:00:00.000Z"
  }
]
```

---

### 3. Create Package
**POST** `/vendor/packages`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "Spotify Premium Family",
  "description": "Nghe nhạc không giới hạn, 6 tài khoản",
  "price": 179000,
  "duration_value": 1,
  "duration_unit": "tháng",
  "category_id": 1,
  "features": "6 tài khoản Premium, Nghe offline, Không quảng cáo",
  "image": "https://example.com/spotify.jpg"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đã tạo gói mới",
  "package": {
    "id": 10,
    "name": "Spotify Premium Family",
    "price": 179000,
    "status": "pending",
    "is_active": false
  }
}
```

---

### 4. Update Package
**PATCH** `/vendor/packages/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "price": 199000,
  "description": "Nghe nhạc không giới hạn, 6 tài khoản Premium",
  "is_active": true
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật gói",
  "package": {
    "id": 10,
    "name": "Spotify Premium Family",
    "price": 199000,
    "is_active": true
  }
}
```

---

### 5. Delete Package
**DELETE** `/vendor/packages/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa gói"
}
```

---

### 6. Get Vendor Orders
**GET** `/vendor/orders`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` (optional): "active" | "expired" | "cancelled"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "status": "active",
      "start_date": "2025-12-15T16:00:00.000Z",
      "end_date": "2026-01-15T16:00:00.000Z",
      "plan": {
        "id": 1,
        "name": "Netflix Premium",
        "price": 260000
      },
      "user": {
        "id": 1,
        "name": "Nguyen Van A",
        "email": "user@example.com"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### 7. Get Vendor Analytics
**GET** `/vendor/analytics`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response Success (200):**
```json
{
  "daily_stats": [
    {
      "date": "2025-12-15",
      "subscriptions": 5,
      "revenue": 1300000
    },
    {
      "date": "2025-12-14",
      "subscriptions": 3,
      "revenue": 780000
    }
  ],
  "total_revenue": 2080000,
  "total_subscriptions": 8
}
```

---

### 8. Get Vendor Reviews
**GET** `/vendor/reviews`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `plan_id` (optional): Filter by specific package
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Dịch vụ rất tốt!",
      "createdAt": "2025-12-15T16:00:00.000Z",
      "plan": {
        "id": 1,
        "name": "Netflix Premium"
      },
      "user": {
        "id": 1,
        "name": "Nguyen Van A"
      }
    }
  ],
  "average_rating": 4.5,
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## VNPay Payment Flow

1. **User creates subscription:**
   ```
   POST /subscriptions
   → subscription với status "pending_payment"
   ```

2. **User processes payment:**
   ```
   POST /payments/process
   → Nhận payment_url từ VNPay
   ```

3. **Redirect user to VNPay:**
   ```
   window.location.href = payment_url
   ```

4. **User completes payment on VNPay:**
   ```
   VNPay redirects to: /payments/vnpay/callback?vnp_ResponseCode=00&...
   ```

5. **Backend processes callback:**
   ```
   - Verify HMAC signature
   - Update payment status to "success"
   - Update subscription status to "active"
   - Set start_date and end_date
   - Create notification
   ```

6. **Frontend handles result:**
   ```
   Check response from callback endpoint
   → Show success/error message to user
   ```

---

## Notes for Frontend Team

1. **Authentication:**
   - Store `access_token` in memory/state
   - Store `refresh_token` in httpOnly cookie or secure storage
   - Include `Authorization: Bearer {access_token}` header in all protected endpoints
   - Handle token refresh when receiving 401 error

2. **Pagination:**
   - Default page: 1
   - Default limit: 10 for lists, 20 for notifications
   - Response includes `total`, `page`, `limit`, `total_pages`

3. **Date Format:**
   - All dates returned in ISO 8601 format: `2025-12-15T16:00:00.000Z`
   - Display using `new Date(dateString).toLocaleString()`

4. **Price Format:**
   - All prices in VNĐ (integer)
   - Display: `price.toLocaleString('vi-VN')` VNĐ

5. **VNPay Integration:**
   - Must redirect to `payment_url` (full page redirect)
   - Cannot use iframe or AJAX
   - Callback URL must be publicly accessible

6. **Error Handling:**
   - Check `statusCode` for HTTP errors
   - Check `success: false` for business logic errors
   - Display appropriate error messages to users

7. **Vendor Role:**
   - Vendor APIs require `role: 'vendor'` in JWT
   - Regular users cannot access vendor endpoints
   - Check user role before displaying vendor UI

---

## Environment Variables (Backend)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=12345678abc
DB_NAME=subscription_platform

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

VNP_TMN_CODE=AMR9G4S5
VNP_HASH_SECRET=MEC47G8KPO7LNYDHTF1V9R6PO0E5F2NQ
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/payments/vnpay/callback
```

---

**Last Updated:** December 15, 2025  
**API Version:** 1.0.0  
**Base URL:** http://localhost:3000
