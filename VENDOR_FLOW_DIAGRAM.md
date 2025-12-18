# Luồng Hoạt Động của Vendor - SubMe App

## Sơ đồ luồng hoạt động

```mermaid
flowchart TD
    Start([Vendor muốn tham gia]) --> Register[Đăng ký tài khoản Vendor<br/>signup.tsx]
    
    Register --> FillInfo[Điền thông tin:<br/>- Tên cửa hàng<br/>- Email<br/>- Password<br/>- Số điện thoại<br/>- Địa chỉ]
    
    FillInfo --> SelectInterests[Chọn lĩnh vực kinh doanh<br/>interests.tsx<br/>Categories: Food, Beauty, Fitness, etc.]
    
    SelectInterests --> SubmitRegistration[API: POST /auth/register<br/>Role: vendor<br/>Status: pending]
    
    SubmitRegistration --> PendingScreen[Màn hình Pending<br/>vendor-pending.tsx]
    
    PendingScreen --> WaitApproval[Chờ Admin phê duyệt<br/>⏳ Trạng thái: pending]
    
    WaitApproval --> AdminReview{Admin xét duyệt}
    
    AdminReview -->|Từ chối| Rejected[Email thông báo từ chối<br/>❌ Không thể đăng nhập]
    AdminReview -->|Chấp nhận| Approved[API: PATCH /vendors/:id/approve<br/>✅ Status: approved]
    
    Rejected --> End1([Kết thúc])
    
    Approved --> EmailNotification[Gửi email thông báo<br/>Vendor có thể đăng nhập]
    
    EmailNotification --> Login[Vendor đăng nhập<br/>signin.tsx]
    
    Login --> VendorDashboard[Dashboard Vendor<br/>app/vendor/index.tsx]
    
    VendorDashboard --> VendorTabs{Chọn tab}
    
    VendorTabs -->|Tab Home| ManagePackages[Quản lý gói dịch vụ<br/>vendor/packages.tsx]
    VendorTabs -->|Tab Orders| ManageOrders[Quản lý đơn hàng<br/>vendor/orders.tsx]
    VendorTabs -->|Tab Profile| VendorProfile[Thông tin cửa hàng<br/>vendor/profile.tsx]
    
    %% Package Management Flow
    ManagePackages --> PackageActions{Hành động}
    
    PackageActions -->|Thêm gói mới| CreatePackage[Tạo gói mới<br/>vendor-package/id.tsx]
    PackageActions -->|Sửa gói| EditPackage[Sửa thông tin gói<br/>vendor-package/id.tsx]
    PackageActions -->|Xóa gói| DeletePackage[Xóa gói dịch vụ]
    PackageActions -->|Xem chi tiết| ViewPackage[Xem chi tiết gói]
    
    CreatePackage --> FillPackageInfo[Điền thông tin gói:<br/>- Tên gói<br/>- Giá<br/>- Thời hạn duration<br/>- Mô tả features<br/>- Category<br/>- Hình ảnh<br/>- Delivery frequency]
    
    FillPackageInfo --> SubmitPackage[API: POST /packages/create<br/>Status: pending<br/>Chờ Admin duyệt]
    
    SubmitPackage --> PackagePending[Gói ở trạng thái pending<br/>⏳ Chờ Admin phê duyệt]
    
    PackagePending --> AdminReviewPackage{Admin duyệt gói}
    
    AdminReviewPackage -->|Từ chối| PackageRejected[❌ Gói bị từ chối<br/>Vendor có thể sửa và gửi lại]
    AdminReviewPackage -->|Chấp nhận| PackageApproved[✅ API: PATCH /packages/:id/approve<br/>Status: approved<br/>Gói được hiển thị công khai]
    
    PackageRejected --> EditPackage
    PackageApproved --> ManagePackages
    
    EditPackage --> UpdatePackage[API: PATCH /packages/:id<br/>Cập nhật thông tin gói]
    UpdatePackage --> ManagePackages
    
    DeletePackage --> ConfirmDelete[Xác nhận xóa gói]
    ConfirmDelete --> APIDelete[API: DELETE /packages/:id<br/>Chỉ xóa được nếu:<br/>- Không có subscription active]
    APIDelete --> ManagePackages
    
    ViewPackage --> PackageStats[Xem thống kê gói:<br/>- Số người đăng ký<br/>- Doanh thu<br/>- Đánh giá<br/>- Reviews từ users]
    PackageStats --> ManagePackages
    
    %% Order Management Flow
    ManageOrders --> OrderList[Danh sách đơn hàng<br/>API: GET /subscriptions/vendor]
    
    OrderList --> FilterOrders{Lọc đơn hàng}
    
    FilterOrders -->|All| AllOrders[Tất cả đơn hàng]
    FilterOrders -->|Active| ActiveOrders[Đơn hàng đang active]
    FilterOrders -->|Expired| ExpiredOrders[Đơn hàng đã hết hạn]
    FilterOrders -->|Cancelled| CancelledOrders[Đơn hàng đã hủy]
    
    AllOrders --> OrderDetail[Click xem chi tiết đơn]
    ActiveOrders --> OrderDetail
    ExpiredOrders --> OrderDetail
    CancelledOrders --> OrderDetail
    
    OrderDetail --> ViewOrderInfo[Xem thông tin:<br/>- User đặt hàng<br/>- Gói dịch vụ<br/>- Ngày bắt đầu/kết thúc<br/>- Trạng thái<br/>- Lịch giao hàng]
    
    ViewOrderInfo --> DeliveryManagement[Quản lý giao hàng<br/>API: GET /delivery/:subscriptionId]
    
    DeliveryManagement --> DeliveryList[Danh sách lịch giao hàng:<br/>- Pending deliveries<br/>- Completed deliveries<br/>- Skipped deliveries]
    
    DeliveryList --> UpdateDelivery{Cập nhật trạng thái}
    
    UpdateDelivery -->|Đã giao| MarkDelivered[API: PATCH /delivery/:id/status<br/>Status: delivered]
    UpdateDelivery -->|Bỏ qua| MarkSkipped[API: PATCH /delivery/:id/status<br/>Status: skipped]
    
    MarkDelivered --> SendNotification[Gửi thông báo cho User<br/>Push notification]
    MarkSkipped --> SendNotification
    
    SendNotification --> ManageOrders
    
    %% Profile Management Flow
    VendorProfile --> ProfileActions{Hành động}
    
    ProfileActions -->|Xem thông tin| ViewProfile[Xem profile:<br/>- Tên cửa hàng<br/>- Email, Phone<br/>- Địa chỉ<br/>- Categories<br/>- Rating<br/>- Số gói đang bán<br/>- Số subscribers]
    
    ProfileActions -->|Sửa thông tin| EditProfile[Sửa thông tin<br/>API: PATCH /vendors/:id]
    
    ProfileActions -->|Đổi mật khẩu| ChangePassword[API: PATCH /auth/change-password]
    
    ProfileActions -->|Thống kê| ViewStatistics[Xem thống kê:<br/>📊 Doanh thu<br/>📦 Số gói đang bán<br/>👥 Tổng subscribers<br/>⭐ Đánh giá trung bình<br/>📈 Biểu đồ theo thời gian]
    
    ProfileActions -->|Đăng xuất| Logout[Đăng xuất tài khoản]
    
    ViewProfile --> VendorProfile
    EditProfile --> VendorProfile
    ChangePassword --> VendorProfile
    ViewStatistics --> VendorProfile
    Logout --> End2([Kết thúc])
    
    %% Notification Flow
    VendorDashboard -.->|Nhận thông báo| Notifications[Thông báo real-time]
    
    Notifications --> NotificationTypes{Loại thông báo}
    
    NotificationTypes -->|New Order| NewOrderNotif[🔔 Có đơn hàng mới<br/>User vừa subscribe gói]
    NotificationTypes -->|Review| NewReviewNotif[⭐ User vừa đánh giá gói]
    NotificationTypes -->|Renewal| RenewalNotif[🔄 User gia hạn subscription]
    NotificationTypes -->|Cancellation| CancelNotif[❌ User hủy subscription]
    NotificationTypes -->|Package Approved| PackageApprovedNotif[✅ Gói được Admin phê duyệt]
    NotificationTypes -->|Package Rejected| PackageRejectedNotif[❌ Gói bị Admin từ chối]
    
    NewOrderNotif --> VendorDashboard
    NewReviewNotif --> VendorDashboard
    RenewalNotif --> VendorDashboard
    CancelNotif --> VendorDashboard
    PackageApprovedNotif --> VendorDashboard
    PackageRejectedNotif --> VendorDashboard

    style Start fill:#e1f5e1
    style End1 fill:#ffe1e1
    style End2 fill:#ffe1e1
    style Approved fill:#90EE90
    style PackageApproved fill:#90EE90
    style Rejected fill:#FFB6C1
    style PackageRejected fill:#FFB6C1
    style PendingScreen fill:#FFE4B5
    style PackagePending fill:#FFE4B5
    style VendorDashboard fill:#87CEEB
```

## Chi tiết các bước

### 1. Đăng ký Vendor (Registration Flow)

#### Bước 1: Đăng ký tài khoản
- **Màn hình**: `app/(auth)/signup.tsx`
- **API**: `POST /auth/register`
- **Thông tin cần thiết**:
  ```json
  {
    "name": "Tên cửa hàng",
    "email": "vendor@example.com",
    "password": "********",
    "phone": "0123456789",
    "address": "Địa chỉ cửa hàng",
    "role": "vendor"
  }
  ```

#### Bước 2: Chọn lĩnh vực kinh doanh
- **Màn hình**: `app/(auth)/interests.tsx`
- **Categories**:
  - 🍔 Food & Beverage (Thực phẩm)
  - 💄 Beauty & Personal Care (Làm đẹp)
  - 💪 Health & Fitness (Sức khỏe)
  - 📚 Education (Giáo dục)
  - 🎮 Entertainment (Giải trí)
  - 🛍️ Shopping (Mua sắm)
  - 🏠 Home Services (Dịch vụ nhà)
  - 🚗 Transportation (Vận chuyển)

#### Bước 3: Chờ phê duyệt
- **Màn hình**: `app/(auth)/vendor-pending.tsx`
- **Trạng thái**: `pending`
- **Hiển thị**:
  - ⏳ Thông báo đang chờ Admin xét duyệt
  - 📧 Email xác nhận đã được gửi
  - ℹ️ Hướng dẫn tiếp theo

#### Bước 4: Admin phê duyệt
- **Admin Panel**: `app/(admin)/vendors.tsx` và `app/(admin)/vendor/[id].tsx`
- **API**: `PATCH /vendors/:id/approve` hoặc `PATCH /vendors/:id/reject`
- **Kết quả**:
  - ✅ **Approved**: Vendor có thể đăng nhập, status = `approved`
  - ❌ **Rejected**: Vendor bị từ chối, status = `rejected`

### 2. Quản lý gói dịch vụ (Package Management)

#### Tạo gói mới
- **Màn hình**: `app/(vendor)/packages.tsx` → Create new
- **API**: `POST /packages/create`
- **Thông tin gói**:
  ```json
  {
    "name": "Tên gói",
    "description": "Mô tả chi tiết",
    "price": 299000,
    "duration": 30,
    "category_id": 1,
    "features": ["Feature 1", "Feature 2"],
    "delivery_frequency": "weekly",
    "image_url": "https://...",
    "vendor_id": 123
  }
  ```
- **Trạng thái ban đầu**: `pending` (Chờ Admin duyệt)

#### Chỉnh sửa gói
- **Màn hình**: `app/vendor-package/[id].tsx`
- **API**: `PATCH /packages/:id`
- **Lưu ý**: 
  - Không thể sửa gói đang có subscription active
  - Sau khi sửa cần Admin duyệt lại

#### Xóa gói
- **API**: `DELETE /packages/:id`
- **Điều kiện**: 
  - Không có subscription active nào
  - Có modal xác nhận trước khi xóa

#### Thống kê gói
- **Thông tin hiển thị**:
  - 👥 Số subscribers hiện tại
  - 💰 Tổng doanh thu
  - ⭐ Rating trung bình
  - 💬 Số lượng reviews
  - 📊 Biểu đồ theo thời gian

### 3. Quản lý đơn hàng (Order Management)

#### Xem danh sách đơn hàng
- **Màn hình**: `app/(vendor)/orders.tsx`
- **API**: `GET /subscriptions/vendor`
- **Lọc theo trạng thái**:
  - **Active**: Đang hoạt động
  - **Expired**: Đã hết hạn
  - **Cancelled**: Đã bị hủy

#### Chi tiết đơn hàng
- **Thông tin**:
  - 👤 Thông tin khách hàng
  - 📦 Gói dịch vụ đã mua
  - 📅 Ngày bắt đầu / kết thúc
  - 💰 Giá trị đơn hàng
  - 📍 Trạng thái hiện tại

#### Quản lý giao hàng
- **API**: 
  - `GET /delivery/:subscriptionId` - Lấy lịch giao hàng
  - `PATCH /delivery/:id/status` - Cập nhật trạng thái
- **Trạng thái giao hàng**:
  - **Pending**: Chưa giao
  - **Delivered**: Đã giao
  - **Skipped**: Bỏ qua (user yêu cầu)
- **Thông báo**: Gửi push notification cho user khi giao hàng

### 4. Quản lý Profile

#### Thông tin cửa hàng
- **Màn hình**: `app/(vendor)/profile.tsx`
- **API**: `GET /vendors/:id`
- **Hiển thị**:
  - 🏪 Tên cửa hàng
  - 📧 Email, ☎️ Phone
  - 📍 Địa chỉ
  - 🏷️ Categories kinh doanh
  - ⭐ Rating (0-5 sao)
  - 📦 Số gói đang bán
  - 👥 Tổng số subscribers

#### Sửa thông tin
- **API**: `PATCH /vendors/:id`
- **Có thể sửa**:
  - Tên cửa hàng
  - Số điện thoại
  - Địa chỉ
  - Ảnh đại diện
  - Mô tả cửa hàng

#### Đổi mật khẩu
- **API**: `PATCH /auth/change-password`
- **Yêu cầu**: 
  - Mật khẩu cũ
  - Mật khẩu mới
  - Xác nhận mật khẩu mới

#### Thống kê tổng quan
- **Dashboard metrics**:
  - 💰 Tổng doanh thu
  - 📈 Doanh thu tháng này
  - 👥 Tổng subscribers
  - 📦 Số gói đang active
  - ⭐ Rating trung bình
  - 📊 Biểu đồ tăng trưởng

### 5. Thông báo (Notifications)

#### Loại thông báo vendor nhận được:

1. **🔔 Đơn hàng mới**
   - User vừa subscribe gói của vendor
   - Click để xem chi tiết đơn hàng

2. **⭐ Đánh giá mới**
   - User vừa rating/review gói
   - Hiển thị số sao và nội dung review

3. **🔄 Gia hạn subscription**
   - User gia hạn gói đã hết hạn
   - Tăng doanh thu

4. **❌ Hủy subscription**
   - User hủy subscription
   - Ghi nhận và cải thiện dịch vụ

5. **✅ Gói được phê duyệt**
   - Admin chấp nhận gói mới
   - Gói được hiển thị công khai

6. **❌ Gói bị từ chối**
   - Admin từ chối gói
   - Có lý do từ chối
   - Vendor có thể sửa và gửi lại

## Các API của Vendor

### Authentication APIs
```
POST   /auth/register              - Đăng ký vendor mới
POST   /auth/login                 - Đăng nhập
POST   /auth/logout                - Đăng xuất
PATCH  /auth/change-password       - Đổi mật khẩu
```

### Vendor Profile APIs
```
GET    /vendors/:id                - Lấy thông tin vendor
PATCH  /vendors/:id                - Cập nhật thông tin
GET    /vendors/me                 - Lấy thông tin vendor hiện tại
GET    /vendors/:id/statistics     - Thống kê vendor
```

### Package Management APIs
```
POST   /packages/create            - Tạo gói mới (status: pending)
GET    /packages/vendor            - Lấy danh sách gói của vendor
GET    /packages/:id               - Chi tiết gói
PATCH  /packages/:id               - Cập nhật gói
DELETE /packages/:id               - Xóa gói
GET    /packages/:id/statistics    - Thống kê gói
```

### Order Management APIs
```
GET    /subscriptions/vendor       - Lấy đơn hàng của vendor
GET    /subscriptions/:id          - Chi tiết đơn hàng
```

### Delivery Management APIs
```
GET    /delivery/:subscriptionId   - Lấy lịch giao hàng
PATCH  /delivery/:id/status        - Cập nhật trạng thái giao hàng
POST   /delivery/:id/note          - Thêm ghi chú giao hàng
```

### Review APIs
```
GET    /reviews/plan/:planId       - Lấy reviews của gói
GET    /reviews/vendor/:vendorId   - Lấy tất cả reviews của vendor
```

### Notification APIs
```
GET    /notifications              - Lấy danh sách thông báo
PATCH  /notifications/:id/read     - Đánh dấu đã đọc
DELETE /notifications/:id          - Xóa thông báo
```

## Quy trình phê duyệt

### Phê duyệt Vendor
1. Vendor đăng ký → Status: `pending`
2. Admin xem danh sách vendor pending
3. Admin xem chi tiết vendor (thông tin, categories)
4. Admin quyết định:
   - **Approve**: Status → `approved`, gửi email thông báo
   - **Reject**: Status → `rejected`, vendor không thể đăng nhập

### Phê duyệt Package
1. Vendor tạo gói → Status: `pending`
2. Admin xem danh sách gói pending
3. Admin xem chi tiết gói (tên, giá, mô tả, features)
4. Admin quyết định:
   - **Approve**: Status → `approved`, gói hiển thị công khai
   - **Reject**: Status → `rejected`, vendor có thể sửa và gửi lại

## Trạng thái Vendor

1. **pending** - Chờ Admin phê duyệt (mới đăng ký)
2. **approved** - Đã được duyệt, có thể đăng nhập
3. **rejected** - Bị từ chối
4. **suspended** - Bị tạm ngưng hoạt động

## Trạng thái Package

1. **pending** - Chờ Admin phê duyệt
2. **approved** - Đã được duyệt, hiển thị công khai
3. **rejected** - Bị từ chối
4. **inactive** - Không hoạt động (vendor tự tắt)

## Lưu ý quan trọng

- ✅ Vendor phải được Admin phê duyệt trước khi đăng nhập
- ✅ Gói mới phải được Admin duyệt trước khi hiển thị
- ✅ Không thể xóa gói đang có subscription active
- ✅ Vendor nhận thông báo real-time khi có đơn hàng mới
- ✅ Vendor quản lý lịch giao hàng và cập nhật trạng thái
- ✅ Vendor có thể xem thống kê doanh thu và subscribers
- ✅ User có thể rating/review gói của vendor
- ✅ Vendor có thể tạm dừng hoạt động gói (inactive)
- ✅ Admin có quyền suspend vendor nếu vi phạm
