// User & Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "vendor" | "admin";
  status?: "pending" | "active" | "approved" | "rejected";
  phone?: string;
  address?: string;
  date_of_birth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<"user" | "vendor" | "admin">;
  signUp: (email: string, password: string, name: string, role: "user " | "vendor", phone?: string, address?: string, date_of_birth?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;  reloadUser: () => Promise<void>;}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// Vendor Types
export interface Vendor {
  id: number;
  name: string;
  description?: string;
  logo?: string;
}

// Package Types (Plans)
export type DurationUnit = "ngày" | "tuần" | "tháng" | "năm";
export type PackageStatus = "pending" | "approved" | "rejected";

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_value: number;
  duration_unit: DurationUnit;
  features?: string;
  image?: string;
  imageUrl?: string; // Backend trả về field này
  status: PackageStatus;
  is_active: boolean;
  subscriber_count: number;
  average_rating: number;
  vendor: Vendor;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending_payment";

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  paused_at?: string;
  cancelled_at?: string;
  createdAt: string;
  updatedAt: string;
  plan: Package;
  payments?: Payment[];
}

// Payment Types
export type PaymentMethodType = "VNPay" | "MoMo" | "ZaloPay" | "Credit Card";
export type PaymentStatus = "pending" | "success" | "failed";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  last4?: string;
  isDefault: boolean;
}

export interface Payment {
  id: number;
  subscription_id: number;
  amount: number | string;
  method: PaymentMethodType;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  createdAt?: string;
  subscription?: Subscription;
}

export interface VNPayResponse {
  success: boolean;
  message: string;
  payment?: {
    id: number;
    subscription_id: number;
    amount: number;
    method: string;
    status: string;
    transaction_id: string;
  };
  payment_url?: string;
}

// Notification Types
export type NotificationType = "subscription" | "payment" | "promotion" | "system";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  createdAt?: string;
}

// Review Types
export interface Review {
  id: number;
  user_id: number;
  plan_id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
  page: number;
  limit: number;
}

// Delivery Schedule Types
export type DeliveryStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "missed" | "cancelled";
export type DeliveryTimeSlot = "morning" | "afternoon" | "evening" | "anytime";

export interface DeliverySchedule {
  id: number;
  subscription_id: number;
  scheduled_date: string;
  time_slot: DeliveryTimeSlot;
  status: DeliveryStatus;
  delivery_address: string;
  delivery_note?: string;
  delivered_at?: string;
  delivery_proof?: string; // URL hình ảnh xác nhận giao hàng
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryScheduleResponse {
  schedules: DeliverySchedule[];
  total: number;
  upcoming: number;
  delivered: number;
}
