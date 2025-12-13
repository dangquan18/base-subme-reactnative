// Helper functions for common operations

// Format currency
export const formatPrice = (
  price: number,
  locale: string = "vi-VN"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Format date
export const formatDate = (
  date: Date | string,
  format: "short" | "long" = "short"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

// Format time
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

// Get relative time (e.g., "2 giờ trước")
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - dateObj.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return formatDate(dateObj);
};

// Calculate days remaining
export const getDaysRemaining = (endDate: Date | string): number => {
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  return Math.max(0, days);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Truncate text
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Format frequency text
export const getFrequencyText = (frequency: string): string => {
  switch (frequency) {
    case "daily":
      return "/ngày";
    case "weekly":
      return "/tuần";
    case "monthly":
      return "/tháng";
    default:
      return "";
  }
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "#4CAF50";
    case "expiring_soon":
      return "#FF9800";
    case "paused":
      return "#9E9E9E";
    case "canceled":
      return "#F44336";
    case "delivered":
      return "#4CAF50";
    case "pending":
      return "#FF9800";
    case "missed":
      return "#F44336";
    default:
      return "#666";
  }
};

// Get status text
export const getStatusText = (status: string): string => {
  switch (status) {
    case "active":
      return "Đang hoạt động";
    case "expiring_soon":
      return "Sắp hết hạn";
    case "paused":
      return "Tạm dừng";
    case "canceled":
      return "Đã hủy";
    case "delivered":
      return "Đã giao";
    case "pending":
      return "Chờ giao";
    case "missed":
      return "Bỏ lỡ";
    default:
      return status;
  }
};

// Debounce function
// export const debounce = <T extends (...args: any[]) => any>(
//   func: T,
//   delay: number
// ): ((...args: Parameters<T>) => void) => {
//   let timeoutId: NodeJS.Timeout;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(...args), delay);
//   };
// };
