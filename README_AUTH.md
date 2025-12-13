# 🔐 JWT Authentication & Role-Based Navigation

## 📝 Tổng quan

Hệ thống đã được tích hợp với backend API sử dụng JWT authentication và phân quyền user/vendor:

### API Endpoint

```
POST http://localhost:3000/auth/login
Body: { "email": "...", "password": "..." }
Response: { "access_token": "jwt_token" }
```

### JWT Payload

```json
{
  "email": "dangq2359@gmail.com",
  "sub": 1, // user id
  "role": "user", // "user" hoặc "vendor"
  "iat": 1763376673, // issued at
  "exp": 1763380273 // expiration
}
```

## 🏗️ Cấu trúc dự án

### 1. **Services** (`/services`)

#### `api.ts` - Base API Client

- Axios instance với base URL: `http://localhost:3000`
- **Request Interceptor**: Tự động thêm Bearer token vào header
- **Response Interceptor**: Xử lý 401 Unauthorized, tự động clear token

#### `auth.service.ts` - Authentication Service

```typescript
authService.signIn(email, password);
// Returns: User object với role
// Side effects:
//   - Lưu access_token vào storage
//   - Decode JWT để lấy user info
//   - Lưu user data vào storage
```

#### `vendor.service.ts` - Vendor APIs

- `getStats()` - Dashboard stats (revenue, orders, packages, rating)
- `getPackages()` - Vendor's packages
- `createPackage()` - Create new package
- `getOrders()` - Vendor's orders
- `updateOrderStatus()` - Update order status

### 2. **Utils** (`/utils`)

#### `storage.ts` - Storage & Token Management

```typescript
// JWT functions
decodeJWT<T>(token: string): T
isTokenExpired(token: string): boolean

// Token manager
tokenManager.setToken(token)
tokenManager.getToken()
tokenManager.setUser(user)
tokenManager.getUser()
tokenManager.clearAuth()
```

#### `auth.ts` - Auth Utilities

```typescript
isAuthenticated(): Promise<boolean>
getUserRole(): Promise<'user' | 'vendor' | null>
isVendor(): Promise<boolean>
isRegularUser(): Promise<boolean>
getUserId(): Promise<string | null>
```

### 3. **Contexts** (`/contexts`)

#### `AuthContext.tsx`

- Manages global auth state
- Auto-loads user on app start
- Validates token expiration
- Returns role on signIn for navigation

```typescript
const { user, signIn, signOut } = useAuth();
const role = await signIn(email, password); // Returns 'user' or 'vendor'
```

### 4. **App Routes**

#### User Flow: `/(tabs)`

- Home (packages, search)
- My Subscriptions
- Notifications
- Profile

#### Vendor Flow: `/(vendor)`

- Dashboard (stats, recent orders)
- Packages (manage packages)
- Orders (order management)
- Profile (store info)

## 🔄 Authentication Flow

### 1. **Login Process**

```
User enters credentials
  ↓
signIn() called
  ↓
POST /auth/login
  ↓
Receive access_token
  ↓
Decode JWT → get user info (id, email, role)
  ↓
Save token + user to storage
  ↓
Return role to component
  ↓
Navigate based on role:
  - role === 'vendor' → /(vendor)
  - role === 'user' → /(tabs)
```

### 2. **Auto Login (App Start)**

```
App launches
  ↓
loadUser() in AuthContext
  ↓
Get token from storage
  ↓
Check if expired (isTokenExpired)
  ↓
If expired → clearAuth()
If valid → load user data
  ↓
Set user in context
```

### 3. **API Requests**

```
Component calls API
  ↓
Request interceptor
  ↓
Get token from storage
  ↓
Add Authorization: Bearer <token>
  ↓
Send request
  ↓
If 401 → Clear auth + redirect to login
```

### 4. **Logout**

```
signOut() called
  ↓
clearAuth()
  ↓
Remove token + user from storage
  ↓
Set user = null in context
  ↓
Navigate to /(auth)/welcome
```

## 🎯 Cách sử dụng

### 1. Login Screen

```typescript
const { signIn } = useAuth();

const handleSignIn = async () => {
  const role = await signIn(email, password);

  if (role === "vendor") {
    router.replace("/(vendor)");
  } else {
    router.replace("/(tabs)");
  }
};
```

### 2. Check User Role

```typescript
import { getUserRole, isVendor } from "@/utils/auth";

const role = await getUserRole(); // 'user' | 'vendor' | null
const vendorCheck = await isVendor(); // boolean
```

### 3. Protected API Calls

```typescript
import { packageService } from "@/services/package.service";

// Token automatically added to headers
const packages = await packageService.getPackages();
```

### 4. Vendor Dashboard

```typescript
import { vendorService } from "@/services/vendor.service";

const stats = await vendorService.getStats();
// { totalRevenue, newOrders, activePackages, averageRating }
```

## 📦 Cài đặt

### 1. Install axios

```bash
npm install axios
```

### 2. Update .env

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Test login

```typescript
// Email: dangq2359@gmail.com
// Password: 12345678
```

## 🔒 Security Notes

1. **Token Storage**: Hiện tại dùng localStorage (web). Production nên dùng:

   - React Native: `expo-secure-store`
   - Web: `httpOnly cookies`

2. **Token Expiration**: Auto check khi app start và khi API call 401

3. **Token Refresh**: TODO - Cần implement refresh token flow

## 🐛 Debugging

### Check token

```typescript
import { tokenManager, decodeJWT } from "@/utils/storage";

const token = await tokenManager.getToken();
const decoded = decodeJWT(token);
console.log("User:", decoded);
```

### Check role

```typescript
const user = await tokenManager.getUser();
console.log("Role:", user.role);
```

### Clear auth manually

```typescript
await tokenManager.clearAuth();
```

## 📱 Screen Mapping

| Role   | Home      | Tab 2         | Tab 3         | Tab 4   |
| ------ | --------- | ------------- | ------------- | ------- |
| user   | Packages  | Subscriptions | Notifications | Profile |
| vendor | Dashboard | Packages      | Orders        | Store   |

## 🚀 Next Steps

- [ ] Implement refresh token
- [ ] Add role-based middleware for API calls
- [ ] Secure storage for tokens (expo-secure-store)
- [ ] Add loading states during auth
- [ ] Implement forgot password
- [ ] Add OAuth (Google/Apple) with JWT
- [ ] Vendor onboarding flow
- [ ] User profile completion
