# Backend: Test Payment API

## Endpoint cần thêm vào Payment Controller

Thêm endpoint này để test thanh toán mà không cần qua VNPay/Stripe/MoMo:

```typescript
// payment.controller.ts

@Post('test')
@UseGuards(JwtAuthGuard)
async testPayment(
  @Body() testPaymentDto: { subscription_id: number; amount: number },
  @Request() req,
) {
  try {
    const { subscription_id, amount } = testPaymentDto;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const subscription = await this.subscriptionService.findOne(subscription_id);
    if (!subscription || subscription.user_id !== userId) {
      throw new BadRequestException('Invalid subscription');
    }

    // Create payment record with success status
    const payment = await this.paymentRepository.save({
      user_id: userId,
      subscription_id: subscription_id,
      amount: amount,
      payment_method: 'TEST',
      status: 'success',
      transaction_id: `TEST-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Update subscription status to active
    await this.subscriptionService.update(subscription_id, {
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + subscription.duration * 24 * 60 * 60 * 1000),
    });

    return {
      success: true,
      payment: payment,
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
```

## Giải thích:
1. Nhận `subscription_id` và `amount` từ frontend
2. Verify subscription thuộc về user đang đăng nhập
3. Tạo payment record với:
   - `status: 'success'` (đã thanh toán thành công)
   - `payment_method: 'TEST'` (để phân biệt đây là test)
   - `transaction_id: 'TEST-{timestamp}'`
4. Cập nhật subscription status thành `active`
5. Trả về payment record

## Test flow:
Frontend → Click "Test thanh toán" → Call API test → Tạo subscription + payment trong DB → Navigate to success screen
