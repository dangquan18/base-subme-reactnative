// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  interests?: string[];
  createdAt: Date;
  isPremium?: boolean;
  role: "user" | "vendor";
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<"user" | "vendor">;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

// Package Types
export type PackageCategory = "food" | "coffee" | "wellness" | "learning";
export type PackageFrequency = "daily" | "weekly" | "monthly";

export interface Package {
  id: string;
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  frequency: PackageFrequency;
  image: string;
  providerId: string;
  providerName: string;
  rating: number;
  subscriberCount: number;
  features: string[];
  deliveryTime?: string;
}

// Subscription Types
export type SubscriptionStatus =
  | "active"
  | "expiring_soon"
  | "paused"
  | "canceled";

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  package: Package;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  nextPaymentDate: Date;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
  deliverySchedule?: DeliverySchedule[];
}

export interface DeliverySchedule {
  id: string;
  date: Date;
  time: string;
  status: "pending" | "delivered" | "missed";
  note?: string;
}

// Payment Types
export type PaymentMethodType = "momo" | "vnpay" | "credit_card" | "wallet";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  last4?: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: PaymentMethod;
  createdAt: Date;
  paidAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "delivery" | "payment" | "promotion" | "system";
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Provider Types (for future use)
export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  description: string;
  rating: number;
  verified: boolean;
  createdAt: Date;
}
