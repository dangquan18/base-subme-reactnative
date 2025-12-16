# 🔗 Deep Linking Setup - VNPay Payment Callback

## Flow thanh toán hoàn chỉnh

```
User nhấn "Thanh toán"
    ↓
App gọi API create subscription
    ↓
App gọi API process payment → Nhận VNPay URL
    ↓
Mở VNPay URL trong browser
    ↓
User thanh toán trên VNPay
    ↓
VNPay redirect → Backend callback URL
    ↓
Backend verify → Update DB → Trả HTML với deep link
    ↓
Browser tự động mở deep link: subme://payment-success?status=success
    ↓
App tự động mở màn hình payment-success
    ↓
Hiển thị animation chúc mừng 🎉
```

## 1. Deep Link đã config trong app.json

```json
{
  "scheme": "subme",
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "subme",
            "host": "payment-success"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  "ios": {
    "bundleIdentifier": "com.subme.app",
    "associatedDomains": ["applinks:subme.app"]
  }
}
```

## 2. Deep Link Format

### Success
```
subme://payment-success?status=success
```

### Failed
```
subme://payment-success?status=failed&message=Payment%20failed
```

## 3. Backend Implementation (Quan trọng!)

### Backend phải trả về HTML redirect với deep link

```typescript
// payments.controller.ts (NestJS)

@Get('vnpay/callback')
async vnpayCallback(@Query() query: any, @Res() res: Response) {
  try {
    // 1. Verify VNPay signature
    const secureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    
    const signed = this.vnpayService.verifySecureHash(params, secureHash);
    
    if (!signed) {
      return res.send(this.generateRedirectHTML('failed', 'Chữ ký không hợp lệ'));
    }

    // 2. Check response code
    const responseCode = query.vnp_ResponseCode;
    const transactionRef = query.vnp_TxnRef;
    const vnpayTransactionNo = query.vnp_TransactionNo;
    const amount = parseInt(query.vnp_Amount) / 100;

    if (responseCode === '00') {
      // 3. Update payment status
      await this.paymentsService.updatePaymentStatus(transactionRef, {
        status: 'success',
        transaction_id: vnpayTransactionNo,
        amount: amount,
      });

      // 4. Activate subscription
      await this.subscriptionsService.activateSubscription(transactionRef);

      // 5. Return HTML redirect to app
      return res.send(this.generateRedirectHTML('success'));
    } else {
      // Payment failed
      await this.paymentsService.updatePaymentStatus(transactionRef, {
        status: 'failed',
        transaction_id: vnpayTransactionNo,
      });

      const errorMessage = this.getVNPayErrorMessage(responseCode);
      return res.send(this.generateRedirectHTML('failed', errorMessage));
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    return res.send(this.generateRedirectHTML('failed', 'Lỗi hệ thống'));
  }
}

// Generate HTML with auto redirect
private generateRedirectHTML(status: 'success' | 'failed', message?: string): string {
  const deepLink = `subme://payment-success?status=${status}${
    message ? '&message=' + encodeURIComponent(message) : ''
  }`;
  
  const statusEmoji = status === 'success' ? '✓' : '✗';
  const statusText = status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại';
  const statusColor = status === 'success' ? '#4CAF50' : '#F44336';
  
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đang xử lý thanh toán...</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid white;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h2 {
          margin: 0 0 10px;
          font-size: 24px;
          color: ${statusColor};
        }
        p {
          margin: 0;
          opacity: 0.9;
          line-height: 1.6;
        }
        .message {
          margin-top: 10px;
          font-size: 14px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 32px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>${statusEmoji} ${statusText}</h2>
        <p>Đang chuyển về ứng dụng...</p>
        ${message ? `<p class="message">${message}</p>` : ''}
        <a href="${deepLink}" class="button" id="openAppBtn" style="display: none;">
          Mở ứng dụng
        </a>
      </div>
      <script>
        // Auto redirect after 1 second
        setTimeout(() => {
          window.location.href = '${deepLink}';
        }, 1000);
        
        // Show button if auto redirect fails
        setTimeout(() => {
          document.getElementById('openAppBtn').style.display = 'inline-block';
        }, 3000);
      </script>
    </body>
    </html>
  `;
}

// Get VNPay error message
private getVNPayErrorMessage(code: string): string {
  const errorMessages: { [key: string]: string } = {
    '07': 'Giao dịch nghi ngờ gian lận',
    '09': 'Thẻ chưa đăng ký dịch vụ',
    '10': 'Xác thực thông tin không chính xác quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán',
    '12': 'Thẻ bị khóa',
    '13': 'Sai mật khẩu xác thực',
    '24': 'Khách hàng hủy giao dịch',
    '51': 'Tài khoản không đủ số dư',
    '65': 'Tài khoản đã vượt quá giới hạn giao dịch',
    '75': 'Ngân hàng đang bảo trì',
    '79': 'Nhập sai mật khẩu quá số lần quy định',
  };
  
  return errorMessages[code] || 'Giao dịch không thành công';
}
```

## 4. Update Payment Status

```typescript
// payments.service.ts

async updatePaymentStatus(
  transactionRef: string,
  data: { status: string; transaction_id?: string; amount?: number }
) {
  const payment = await this.paymentRepository.findOne({
    where: { transaction_ref: transactionRef },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  Object.assign(payment, {
    status: data.status,
    transaction_id: data.transaction_id,
    amount: data.amount,
    updated_at: new Date(),
  });

  return await this.paymentRepository.save(payment);
}
```

## 5. Activate Subscription

```typescript
// subscriptions.service.ts

async activateSubscription(transactionRef: string) {
  // Find payment with subscription
  const payment = await this.paymentRepository.findOne({
    where: { transaction_ref: transactionRef },
    relations: ['subscription', 'subscription.plan'],
  });

  if (!payment?.subscription) {
    throw new Error('Subscription not found');
  }

  const subscription = payment.subscription;
  const plan = subscription.plan;

  // Calculate end date
  const startDate = new Date();
  const endDate = new Date(startDate);
  
  if (plan.duration_unit === 'month') {
    endDate.setMonth(endDate.getMonth() + plan.duration_value);
  } else if (plan.duration_unit === 'year') {
    endDate.setFullYear(endDate.getFullYear() + plan.duration_value);
  } else if (plan.duration_unit === 'day') {
    endDate.setDate(endDate.getDate() + plan.duration_value);
  }

  // Update subscription
  Object.assign(subscription, {
    status: 'active',
    start_date: startDate,
    end_date: endDate,
    updated_at: new Date(),
  });

  return await this.subscriptionRepository.save(subscription);
}
```

## 6. Test trên Development

### Web (browser)
- Deep link sẽ không hoạt động trên web
- Cần build app thật để test

### Android/iOS (Expo Go hoặc Development Build)
1. Chạy app:
   ```bash
   npx expo start
   ```

2. Test deep link bằng terminal:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "subme://payment-success?status=success"
   
   # iOS
   xcrun simctl openurl booted "subme://payment-success?status=success"
   ```

3. Hoặc test full flow:
   - Thanh toán thật trên VNPay sandbox
   - Backend sẽ redirect về deep link
   - App tự động mở

## 7. Verify Deep Link hoạt động

1. **Check console log:**
   ```
   Deep link received: subme://payment-success?status=success
   ```

2. **App tự động chuyển sang màn hình payment-success**

3. **Hiển thị animation chúc mừng**

## 8. Troubleshooting

### Deep link không hoạt động?
- ✅ Check `scheme: "subme"` trong app.json
- ✅ Restart app sau khi sửa app.json
- ✅ Build lại app (không dùng Expo Go)

### Backend không redirect?
- ✅ Check backend trả về HTML đúng format
- ✅ Check deep link URL đúng: `subme://payment-success`

### App không mở?
- ✅ App phải đang chạy (background hoặc foreground)
- ✅ Trên iOS: cần build với Xcode
- ✅ Trên Android: cần set intent filters

## 9. Production Checklist

- [ ] Config deep link production URL
- [ ] Backend callback URL phải là HTTPS
- [ ] Test trên thiết bị thật
- [ ] Test cả success và failed flows
- [ ] Log tất cả callbacks để debug
- [ ] Setup monitoring cho failed payments

## 10. VNPay Response Codes

| Code | Meaning |
|------|---------|
| 00   | Giao dịch thành công |
| 07   | Giao dịch nghi ngờ gian lận |
| 09   | Thẻ chưa đăng ký dịch vụ |
| 24   | Khách hàng hủy giao dịch |
| 51   | Tài khoản không đủ số dư |
| 65   | Tài khoản vượt hạn mức |

Xem đầy đủ tại: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
