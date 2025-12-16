# Hướng dẫn Backend xử lý VNPay Callback

## Vấn đề
VNPay redirect về backend URL, nhưng app không biết thanh toán đã hoàn thành.

## Giải pháp
Backend endpoint `/payments/vnpay/callback` phải:
1. Nhận params từ VNPay
2. Verify chữ ký (secure hash)
3. Cập nhật payment status trong database
4. **Trả về HTML redirect với deep link để mở lại app**

## Code Backend (NestJS)

```typescript
// payments.controller.ts

@Get('vnpay/callback')
async vnpayCallback(@Query() query: any, @Res() res: Response) {
  try {
    // 1. Verify VNPay signature
    const secureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;
    
    const signed = this.vnpayService.verifySecureHash(query, secureHash);
    
    if (!signed) {
      return res.send(this.generateRedirectHTML('failed', 'Invalid signature'));
    }

    // 2. Kiểm tra response code
    const responseCode = query.vnp_ResponseCode;
    const transactionRef = query.vnp_TxnRef;
    const vnpayTransactionNo = query.vnp_TransactionNo;
    const amount = query.vnp_Amount / 100; // VNPay trả về amount * 100

    // 3. Cập nhật payment trong database
    if (responseCode === '00') {
      // Thanh toán thành công
      await this.paymentsService.updatePaymentStatus(transactionRef, {
        status: 'success',
        transaction_id: vnpayTransactionNo,
        amount: amount,
      });

      // 4. Cập nhật subscription status thành active
      await this.subscriptionsService.activateSubscription(transactionRef);

      // 5. Redirect về app với deep link
      return res.send(this.generateRedirectHTML('success'));
    } else {
      // Thanh toán thất bại
      await this.paymentsService.updatePaymentStatus(transactionRef, {
        status: 'failed',
        transaction_id: vnpayTransactionNo,
      });

      return res.send(this.generateRedirectHTML('failed', 'Payment failed'));
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    return res.send(this.generateRedirectHTML('failed', 'System error'));
  }
}

// Helper method để generate HTML redirect
private generateRedirectHTML(status: 'success' | 'failed', message?: string): string {
  const deepLink = `subme://payment-success?status=${status}${message ? '&message=' + encodeURIComponent(message) : ''}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đang xử lý thanh toán...</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
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
        h2 { margin: 0 0 10px; }
        p { margin: 0; opacity: 0.9; }
        .success { color: #4CAF50; }
        .failed { color: #F44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>${status === 'success' ? '✓ Thanh toán thành công!' : '✗ Thanh toán thất bại'}</h2>
        <p>Đang chuyển về ứng dụng...</p>
        ${message ? `<p style="margin-top: 10px; font-size: 14px;">${message}</p>` : ''}
      </div>
      <script>
        // Tự động redirect sau 1 giây
        setTimeout(() => {
          window.location.href = '${deepLink}';
        }, 1000);
        
        // Fallback: Nếu deep link không hoạt động, hiển thị nút
        setTimeout(() => {
          const button = document.createElement('a');
          button.href = '${deepLink}';
          button.textContent = 'Nhấn để mở ứng dụng';
          button.style.cssText = 'display: inline-block; margin-top: 20px; padding: 12px 24px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600;';
          document.querySelector('.container').appendChild(button);
        }, 3000);
      </script>
    </body>
    </html>
  `;
}
```

## Verify Secure Hash Method

```typescript
// vnpay.service.ts

verifySecureHash(params: any, secureHash: string): boolean {
  // Sort params
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        result[key] = params[key];
      }
      return result;
    }, {});

  // Create sign string
  const signData = Object.keys(sortedParams)
    .map(key => `${key}=${sortedParams[key]}`)
    .join('&');

  // Hash with secret key
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', this.vnpHashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
}
```

## Cập nhật Payment Status

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

  payment.status = data.status;
  if (data.transaction_id) {
    payment.transaction_id = data.transaction_id;
  }
  if (data.amount) {
    payment.amount = data.amount;
  }

  return await this.paymentRepository.save(payment);
}
```

## Activate Subscription

```typescript
// subscriptions.service.ts

async activateSubscription(transactionRef: string) {
  // Tìm payment
  const payment = await this.paymentRepository.findOne({
    where: { transaction_ref: transactionRef },
    relations: ['subscription'],
  });

  if (!payment || !payment.subscription) {
    throw new Error('Subscription not found');
  }

  // Cập nhật subscription status
  payment.subscription.status = 'active';
  payment.subscription.start_date = new Date();
  
  // Tính end_date dựa vào plan duration
  const plan = await this.planRepository.findOne({
    where: { id: payment.subscription.plan_id },
  });
  
  const endDate = new Date();
  if (plan.duration_unit === 'month') {
    endDate.setMonth(endDate.getMonth() + plan.duration_value);
  } else if (plan.duration_unit === 'year') {
    endDate.setFullYear(endDate.getFullYear() + plan.duration_value);
  }
  
  payment.subscription.end_date = endDate;

  return await this.subscriptionRepository.save(payment.subscription);
}
```

## Deep Link Format

App sẽ nhận deep link:
- Success: `subme://payment-success?status=success`
- Failed: `subme://payment-success?status=failed&message=Payment+failed`

## Test Flow

1. User nhấn "Thanh toán" trong app
2. App gọi API `/payments/process` → nhận VNPay URL
3. Mở VNPay URL trong browser
4. User thanh toán thành công
5. VNPay redirect → `http://localhost:3000/payments/vnpay/callback?...`
6. Backend verify → update DB → trả HTML với deep link
7. Browser tự động redirect → `subme://payment-success?status=success`
8. App mở lại và hiển thị màn hình thành công

## Lưu ý

- Deep link `subme://` phải được config trong app.json
- Backend URL phải là HTTPS trong production (VNPay yêu cầu)
- Verify secure hash để đảm bảo request từ VNPay thật
- Lưu transaction_id từ VNPay để đối soát sau này
