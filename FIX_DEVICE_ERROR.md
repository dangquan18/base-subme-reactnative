# 🔧 Fix Lỗi Chạy App Trên Điện Thoại Thật

## ✅ Đã Fix

### 1. Lỗi LocalStorage (FIXED)
**Lỗi:** `Property 'localStorage' doesn't exist`

**Nguyên nhân:** LocalStorage là Web API, không có trong React Native.

**Giải pháp:** Đã thay bằng `@react-native-async-storage/async-storage` trong file `utils/storage.ts`

```typescript
// Before (chỉ hoạt động trên web)
localStorage.setItem(key, value)

// After (hoạt động cả web và mobile)
if (Platform.OS === 'web') {
  localStorage.setItem(key, value)
} else {
  await AsyncStorage.setItem(key, value)
}
```

## ⚠️ CẦN FIX: Network Error

### 2. Lỗi Network Error - Localhost
**Lỗi:** `Network Error`, `CORS Error`

**Nguyên nhân:** 
- `localhost` hoặc `127.0.0.1` trên điện thoại là **chính điện thoại đó**, không phải máy tính
- Backend đang chạy trên máy tính ở `localhost:3000`
- Điện thoại không thể connect đến `localhost:3000` của máy tính

### Giải pháp: Dùng IP máy tính thay cho localhost

#### Bước 1: Tìm IP máy tính

**Windows:**
```bash
# Mở Command Prompt (CMD)
ipconfig

# Tìm dòng "IPv4 Address"
# Ví dụ: IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

**Mac:**
```bash
# Mở Terminal
ifconfig | grep "inet "

# Hoặc xem trong System Preferences > Network
```

**Linux:**
```bash
# Mở Terminal
ifconfig
# hoặc
ip addr show
```

#### Bước 2: Cập nhật file `.env`

Mở file `.env` và thay đổi:

```bash
# FROM (localhost - không hoạt động trên device)
EXPO_PUBLIC_API_URL=http://localhost:3000

# TO (IP máy tính - thay 192.168.1.100 bằng IP máy bạn)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

#### Bước 3: Đảm bảo điện thoại và máy tính cùng WiFi

- Máy tính: Kết nối WiFi `MyWiFi`
- Điện thoại: Kết nối WiFi `MyWiFi` (cùng mạng)

#### Bước 4: Backend phải cho phép IP này (CORS)

Backend NestJS cần config:

```typescript
// main.ts
app.enableCors({
  origin: '*', // Hoặc chỉ định IP cụ thể
  credentials: true,
});
```

#### Bước 5: Restart Expo

```bash
# Stop server hiện tại (Ctrl + C)
# Xóa cache
npx expo start -c

# Hoặc
npm start -- --clear
```

## 📋 Checklist

- [x] Fix localStorage → AsyncStorage ✅
- [ ] Tìm IP máy tính (vd: `192.168.1.100`)
- [ ] Cập nhật `.env` với IP máy tính
- [ ] Đảm bảo máy tính và điện thoại cùng WiFi
- [ ] Kiểm tra backend CORS đã enable
- [ ] Kiểm tra backend đang chạy
- [ ] Restart Expo với clear cache
- [ ] Test lại đăng nhập trên điện thoại

## 🔍 Debug Tips

### Kiểm tra Backend có chạy không:
```bash
# Trên máy tính, mở browser và truy cập:
http://localhost:3000

# Nếu thấy response → Backend OK
```

### Kiểm tra điện thoại có connect được không:
```bash
# Trên máy tính, ping địa chỉ điện thoại (xem IP trong Expo Dev Tools)
ping 192.168.1.XXX

# Hoặc ngược lại, từ máy tính kiểm tra:
curl http://192.168.1.100:3000
```

### Test API URL từ điện thoại:
Mở Chrome trên điện thoại và truy cập:
```
http://192.168.1.100:3000
```
Nếu thấy backend response → IP đúng!

## ⚡ Quick Fix Commands

```bash
# 1. Lấy IP máy tính
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Cập nhật .env (thay YOUR_IP)
# EXPO_PUBLIC_API_URL=http://YOUR_IP:3000

# 3. Clear cache và restart
npx expo start -c

# 4. Quét QR code từ điện thoại
```

## 🎯 Kết quả mong đợi

Sau khi fix:
- ✅ Không còn lỗi `localStorage doesn't exist`
- ✅ Không còn lỗi `Network Error`
- ✅ API requests thành công
- ✅ Login được từ điện thoại
- ✅ App hoạt động bình thường

## 📌 Lưu ý

1. **Mỗi khi đổi mạng WiFi**, phải update lại IP trong `.env`
2. **Firewall** có thể chặn connection, tạm tắt hoặc cho phép port 3000
3. **Trong Production**, sẽ dùng domain thật (vd: `https://api.myapp.com`)
4. **Đừng commit** file `.env` lên Git (đã có trong `.gitignore`)

## 🆘 Nếu vẫn lỗi

Thử các cách sau:

### Option 1: Dùng ngrok (tunnel localhost)
```bash
# Install ngrok
npm install -g ngrok

# Tunnel localhost:3000
ngrok http 3000

# Copy URL https://xxxx.ngrok.io vào .env
EXPO_PUBLIC_API_URL=https://xxxx.ngrok.io
```

### Option 2: Dùng Expo Tunnel
```bash
# Start with tunnel mode
npx expo start --tunnel
```

### Option 3: Deploy backend lên server
- Deploy lên Heroku, Railway, Render, hoặc VPS
- Update EXPO_PUBLIC_API_URL với URL production
