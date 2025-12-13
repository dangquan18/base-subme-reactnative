import { PackageCategory } from "@/types";

export const CATEGORIES: Array<{
  id: PackageCategory;
  name: string;
  icon: string;
  emoji: string;
  color: string;
}> = [
  {
    id: "coffee",
    name: "Cà phê",
    icon: "coffee",
    emoji: "☕️",
    color: "#6F4E37",
  },
  {
    id: "food",
    name: "Đồ ăn",
    icon: "restaurant",
    emoji: "🍱",
    color: "#FF6B6B",
  },
  {
    id: "wellness",
    name: "Sức khỏe",
    icon: "fitness",
    emoji: "💪",
    color: "#4ECDC4",
  },
  {
    id: "learning",
    name: "Học tập",
    icon: "school",
    emoji: "🎓",
    color: "#95E1D3",
  },
];

export const INTERESTS = [
  { id: "coffee", label: "Cà phê", emoji: "☕️" },
  { id: "food", label: "Cơm", emoji: "🍱" },
  { id: "wellness", label: "Gym", emoji: "💪" },
  { id: "learning", label: "Học tập", emoji: "🎓" },
  { id: "tea", label: "Trà sữa", emoji: "🧋" },
  { id: "breakfast", label: "Sáng", emoji: "🥐" },
];

export const PAYMENT_METHODS = [
  {
    id: "momo",
    name: "MoMo",
    icon: "account-balance-wallet",
    color: "#A50064",
  },
  { id: "vnpay", name: "VNPay", icon: "payment", color: "#0066CC" },
  {
    id: "credit_card",
    name: "Thẻ tín dụng",
    icon: "credit-card",
    color: "#34495E",
  },
];
