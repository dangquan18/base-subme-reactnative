# 📦 Delivery Schedule API - Hướng dẫn Backend

## Tổng quan

Hệ thống Delivery Schedule quản lý lịch giao hàng cho các gói subscription dạng giao hàng định kỳ (đồ ăn, cà phê, tạp chí, v.v.)

## Database Schema

### Table: `delivery_schedules`

```sql
CREATE TABLE delivery_schedules (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening', 'anytime')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'missed', 'cancelled')),
  delivery_address TEXT NOT NULL,
  delivery_note TEXT,
  delivered_at TIMESTAMP,
  delivery_proof VARCHAR(255), -- URL hình ảnh xác nhận giao hàng
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_status (status)
);
```

### Enum Types

**DeliveryStatus:**
- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận, chuẩn bị giao
- `in_transit`: Đang trên đường giao
- `delivered`: Đã giao thành công
- `missed`: Giao lỡ (không có người nhận)
- `cancelled`: Đã hủy

**TimeSlot:**
- `morning`: Sáng (7h - 11h)
- `afternoon`: Chiều (13h - 17h)
- `evening`: Tối (18h - 21h)
- `anytime`: Cả ngày

## Entity (TypeORM)

```typescript
// delivery-schedule.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subscription } from './subscription.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  MISSED = 'missed',
  CANCELLED = 'cancelled'
}

export enum TimeSlot {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  ANYTIME = 'anytime'
}

@Entity('delivery_schedules')
export class DeliverySchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(() => Subscription, subscription => subscription.deliveries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'date', name: 'scheduled_date' })
  scheduledDate: Date;

  @Column({
    type: 'enum',
    enum: TimeSlot,
    name: 'time_slot'
  })
  timeSlot: TimeSlot;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING
  })
  status: DeliveryStatus;

  @Column({ type: 'text', name: 'delivery_address' })
  deliveryAddress: string;

  @Column({ type: 'text', nullable: true, name: 'delivery_note' })
  deliveryNote: string;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date;

  @Column({ nullable: true, name: 'delivery_proof' })
  deliveryProof: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

## API Endpoints

### 1. Get Delivery Schedule for Subscription

```typescript
GET /subscriptions/:subscriptionId/deliveries
```

**Query Params:**
- `status` (optional): Filter by status
- `from_date` (optional): Start date (YYYY-MM-DD)
- `to_date` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10

**Response:**
```json
{
  "schedules": [
    {
      "id": 1,
      "subscription_id": 5,
      "scheduled_date": "2025-12-17",
      "time_slot": "morning",
      "status": "confirmed",
      "delivery_address": "123 Nguyễn Huệ, Q1, TP.HCM",
      "delivery_note": "Gọi chuông 2 lần",
      "delivered_at": null,
      "delivery_proof": null,
      "createdAt": "2025-12-16T10:00:00Z",
      "updatedAt": "2025-12-16T10:00:00Z"
    }
  ],
  "total": 30,
  "upcoming": 15,
  "delivered": 10
}
```

**Implementation:**
```typescript
@Get(':subscriptionId/deliveries')
async getDeliveries(
  @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
  @Query('status') status?: DeliveryStatus,
  @Query('from_date') fromDate?: string,
  @Query('to_date') toDate?: string,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
) {
  return this.deliveryService.getSubscriptionDeliveries(
    subscriptionId,
    { status, fromDate, toDate, page, limit }
  );
}
```

### 2. Get Upcoming Deliveries (User)

```typescript
GET /deliveries/upcoming
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "deliveries": [
    {
      "id": 1,
      "subscription_id": 5,
      "scheduled_date": "2025-12-17",
      "time_slot": "morning",
      "status": "confirmed",
      "delivery_address": "123 Nguyễn Huệ, Q1, TP.HCM",
      "subscription": {
        "id": 5,
        "plan": {
          "name": "Cà phê sáng Premium",
          "vendor": {
            "name": "The Coffee House"
          }
        }
      }
    }
  ]
}
```

### 3. Get Delivery Detail

```typescript
GET /deliveries/:id
```

**Response:**
```json
{
  "id": 1,
  "subscription_id": 5,
  "scheduled_date": "2025-12-17",
  "time_slot": "morning",
  "status": "delivered",
  "delivery_address": "123 Nguyễn Huệ, Q1, TP.HCM",
  "delivery_note": "Gọi chuông 2 lần",
  "delivered_at": "2025-12-17T08:30:00Z",
  "delivery_proof": "https://storage.example.com/proof/123.jpg",
  "subscription": {
    "plan": {
      "name": "Cà phê sáng Premium"
    }
  }
}
```

### 4. Update Delivery Note

```typescript
PATCH /deliveries/:id/note
```

**Body:**
```json
{
  "delivery_note": "Để ở bảo vệ tầng 1"
}
```

**Response:**
```json
{
  "success": true,
  "delivery": {
    "id": 1,
    "delivery_note": "Để ở bảo vệ tầng 1",
    "updatedAt": "2025-12-16T14:00:00Z"
  }
}
```

### 5. Report Delivery Issue

```typescript
POST /deliveries/:id/report
```

**Body:**
```json
{
  "issue": "Không nhận được hàng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã ghi nhận vấn đề. Chúng tôi sẽ liên hệ trong 24h."
}
```

### 6. Confirm Delivery Received (Customer)

```typescript
POST /deliveries/:id/confirm
```

**Response:**
```json
{
  "success": true,
  "delivery": {
    "id": 1,
    "status": "delivered",
    "delivered_at": "2025-12-17T08:30:00Z"
  }
}
```

### 7. Update Delivery Status (Vendor/Admin)

```typescript
PATCH /deliveries/:id/status
```

**Body:**
```json
{
  "status": "in_transit"
}
```

### 8. Upload Delivery Proof (Vendor)

```typescript
POST /deliveries/:id/proof
```

**Body:** multipart/form-data with `image` field

**Response:**
```json
{
  "success": true,
  "delivery_proof": "https://storage.example.com/proof/123.jpg"
}
```

## Service Implementation

```typescript
// delivery.service.ts
@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliverySchedule)
    private deliveryRepo: Repository<DeliverySchedule>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
  ) {}

  async getSubscriptionDeliveries(
    subscriptionId: number,
    options: {
      status?: DeliveryStatus;
      fromDate?: string;
      toDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const { status, fromDate, toDate, page = 1, limit = 10 } = options;
    
    const query = this.deliveryRepo
      .createQueryBuilder('delivery')
      .where('delivery.subscription_id = :subscriptionId', { subscriptionId })
      .orderBy('delivery.scheduled_date', 'ASC');

    if (status) {
      query.andWhere('delivery.status = :status', { status });
    }

    if (fromDate) {
      query.andWhere('delivery.scheduled_date >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('delivery.scheduled_date <= :toDate', { toDate });
    }

    const [schedules, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Count statistics
    const [upcoming, delivered] = await Promise.all([
      this.deliveryRepo.count({
        where: {
          subscriptionId,
          status: In([DeliveryStatus.PENDING, DeliveryStatus.CONFIRMED, DeliveryStatus.IN_TRANSIT]),
          scheduledDate: MoreThanOrEqual(new Date()),
        },
      }),
      this.deliveryRepo.count({
        where: {
          subscriptionId,
          status: DeliveryStatus.DELIVERED,
        },
      }),
    ]);

    return {
      schedules,
      total,
      upcoming,
      delivered,
    };
  }

  async createDeliverySchedules(subscription: Subscription) {
    // Tạo lịch giao hàng tự động khi subscription active
    const plan = subscription.plan;
    const schedules: Partial<DeliverySchedule>[] = [];
    
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    
    // Tùy thuộc vào plan.duration_unit để tạo lịch
    // Ví dụ: giao hàng hàng ngày
    if (plan.deliveryFrequency === 'daily') {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        schedules.push({
          subscriptionId: subscription.id,
          scheduledDate: new Date(d),
          timeSlot: TimeSlot.MORNING,
          status: DeliveryStatus.PENDING,
          deliveryAddress: subscription.user.address,
        });
      }
    }
    
    return await this.deliveryRepo.save(schedules);
  }
}
```

## Auto-generate Delivery Schedules

Khi subscription được activate (sau thanh toán), tự động tạo delivery schedule:

```typescript
// subscription.service.ts
async activateSubscription(subscriptionId: number) {
  const subscription = await this.subscriptionRepo.findOne({
    where: { id: subscriptionId },
    relations: ['plan', 'user'],
  });

  subscription.status = 'active';
  subscription.startDate = new Date();
  
  // Calculate end date
  const endDate = new Date();
  if (subscription.plan.durationUnit === 'month') {
    endDate.setMonth(endDate.getMonth() + subscription.plan.durationValue);
  }
  subscription.endDate = endDate;

  await this.subscriptionRepo.save(subscription);

  // Auto-create delivery schedules
  await this.deliveryService.createDeliverySchedules(subscription);

  return subscription;
}
```

## Notifications

Gửi thông báo cho user về delivery:

```typescript
// Khi delivery sắp đến (1 ngày trước)
await this.notificationService.create({
  userId: subscription.userId,
  type: 'subscription',
  title: 'Nhắc nhở giao hàng',
  message: `Gói "${plan.name}" sẽ được giao vào ngày mai lúc ${timeSlot}`,
});

// Khi delivery đang giao
await this.notificationService.create({
  userId: subscription.userId,
  type: 'subscription',
  title: 'Đơn hàng đang giao',
  message: `Gói "${plan.name}" đang trên đường đến bạn`,
});

// Khi delivery hoàn thành
await this.notificationService.create({
  userId: subscription.userId,
  type: 'subscription',
  title: 'Giao hàng thành công',
  message: `Gói "${plan.name}" đã được giao thành công`,
});
```

## Testing

```bash
# Get delivery schedule
GET http://localhost:3000/subscriptions/1/deliveries

# Get upcoming deliveries
GET http://localhost:3000/deliveries/upcoming
Authorization: Bearer <token>

# Update delivery note
PATCH http://localhost:3000/deliveries/1/note
{
  "delivery_note": "Để ở bảo vệ"
}

# Report issue
POST http://localhost:3000/deliveries/1/report
{
  "issue": "Không nhận được hàng"
}
```
