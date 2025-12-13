# 🚨 CORS Error - Hướng dẫn fix Backend

## Vấn đề

```
Access to XMLHttpRequest at 'http://localhost:3000/auth/login'
from origin 'http://localhost:8081' has been blocked by CORS policy
```

## Nguyên nhân

Backend (NestJS/Express) chưa enable CORS để cho phép frontend gọi API từ domain khác.

## ✅ Giải pháp - Fix Backend

### Nếu dùng **NestJS** (main.ts):

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ["http://localhost:8081", "http://localhost:19006"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  await app.listen(3000);
}
bootstrap();
```

### Nếu dùng **Express** (server.js hoặc app.js):

```javascript
const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:8081", "http://localhost:19006"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Hoặc đơn giản hơn (cho development):
app.use(cors()); // Allow tất cả origins

app.listen(3000);
```

### Cài package CORS (nếu chưa có):

```bash
# NestJS
npm install @nestjs/platform-express

# Express
npm install cors
npm install @types/cors --save-dev  # Nếu dùng TypeScript
```

## 🔧 Alternative - Proxy (Không khuyến khích)

Nếu không thể sửa backend ngay, có thể dùng proxy:

### metro.config.js (React Native Web)

```javascript
module.exports = {
  // ... other config
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
};
```

Sau đó đổi API URL:

```
EXPO_PUBLIC_API_URL=http://localhost:8081/api
```

## ✅ Kiểm tra sau khi fix

1. Restart backend server
2. Test bằng curl:

```bash
curl -X OPTIONS http://localhost:3000/auth/login \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Nên thấy response headers:

```
Access-Control-Allow-Origin: http://localhost:8081
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

3. Test login lại từ app

## 📝 Production Note

Trong production, nên limit origins cụ thể:

```typescript
origin: [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
],
```

KHÔNG nên dùng `origin: '*'` với `credentials: true` trong production!
