import { Package } from "@/types";

export const MOCK_PACKAGES: Package[] = [
  // COFFEE
  {
    id: "1",
    name: "Cà phê sáng mỗi ngày",
    description:
      "Bắt đầu ngày mới với ly cà phê ngon từ The Coffee House. Giao hàng trước 8h sáng.",
    category: "coffee",
    price: 299000,
    frequency: "daily",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    providerId: "1",
    providerName: "The Coffee House",
    rating: 4.8,
    subscriberCount: 1234,
    features: [
      "Free delivery",
      "Chọn size",
      "Đổi món linh hoạt",
      "Giao trước 8h",
    ],
    deliveryTime: "7:00 - 8:00",
  },
  {
    id: "2",
    name: "Cà phê văn phòng",
    description:
      "Cà phê nguyên chất cho cả team. Miễn phí giao hàng trong bán kính 5km.",
    category: "coffee",
    price: 899000,
    frequency: "weekly",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348",
    providerId: "1",
    providerName: "The Coffee House",
    rating: 4.7,
    subscriberCount: 567,
    features: [
      "10-20 ly/ngày",
      "Miễn phí giao",
      "Hóa đơn công ty",
      "Ly tái sử dụng",
    ],
    deliveryTime: "9:00 - 10:00",
  },
  {
    id: "3",
    name: "Combo Cà phê + Bánh",
    description:
      "Trọn gói cà phê và bánh ngọt mỗi sáng. Đa dạng menu, không trùng lặp.",
    category: "coffee",
    price: 399000,
    frequency: "daily",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    providerId: "2",
    providerName: "Highlands Coffee",
    rating: 4.9,
    subscriberCount: 2134,
    features: ["Cà phê + Bánh", "Menu đa dạng", "Không trùng lặp", "Tích điểm"],
    deliveryTime: "7:30 - 8:30",
  },

  // FOOD
  {
    id: "4",
    name: "Cơm trưa văn phòng",
    description:
      "Bữa trưa healthy, dinh dưỡng cân đối. Thực đơn thay đổi hàng ngày.",
    category: "food",
    price: 899000,
    frequency: "weekly",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    providerId: "3",
    providerName: "Healthy Box",
    rating: 4.6,
    subscriberCount: 856,
    features: [
      "Thực đơn đa dạng",
      "Dinh dưỡng cân đối",
      "Giao tận nơi",
      "7 ngày/tuần",
    ],
  },
  {
    id: "5",
    name: "Eat Clean 30 ngày",
    description:
      "Chế độ ăn clean toàn diện cho người giảm cân. Tư vấn dinh dưỡng miễn phí.",
    category: "food",
    price: 2499000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
    providerId: "3",
    providerName: "Healthy Box",
    rating: 4.8,
    subscriberCount: 3421,
    features: [
      "Giảm cân hiệu quả",
      "Tư vấn miễn phí",
      "Theo dõi tiến độ",
      "App riêng",
    ],
  },
  {
    id: "6",
    name: "Bữa sáng dinh dưỡng",
    description:
      "Khởi đầu ngày với bữa sáng healthy. Smoothie, yến mạch, trứng và nhiều hơn nữa.",
    category: "food",
    price: 599000,
    frequency: "weekly",
    image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7",
    providerId: "4",
    providerName: "Morning Glory",
    rating: 4.7,
    subscriberCount: 1567,
    features: [
      "Smoothie tươi",
      "Yến mạch organic",
      "Giao sớm 6h",
      "Không đường",
    ],
    deliveryTime: "6:00 - 7:00",
  },
  {
    id: "7",
    name: "Bữa tối gia đình",
    description:
      "4-6 người ăn. Thực đơn đa dạng từ Á đến Âu. Giao tận nhà trước 6h chiều.",
    category: "food",
    price: 1899000,
    frequency: "weekly",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    providerId: "5",
    providerName: "Family Kitchen",
    rating: 4.9,
    subscriberCount: 2341,
    features: [
      "4-6 người",
      "Thực đơn Á-Âu",
      "Giao 17h-18h",
      "Đóng hộp cẩn thận",
    ],
    deliveryTime: "17:00 - 18:00",
  },

  // WELLNESS
  {
    id: "8",
    name: "Gói tập Gym 30 ngày",
    description:
      "Rèn luyện sức khỏe mỗi ngày tại phòng gym hiện đại. Có HLV hỗ trợ.",
    category: "wellness",
    price: 599000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    providerId: "6",
    providerName: "Fitness Plus",
    rating: 4.9,
    subscriberCount: 2341,
    features: [
      "Phòng tập hiện đại",
      "Huấn luyện viên",
      "Lịch linh hoạt",
      "Sauna miễn phí",
    ],
  },
  {
    id: "9",
    name: "Yoga buổi sáng",
    description:
      "Lớp yoga online mỗi sáng 6h. Giáo viên chuyên nghiệp, phù hợp mọi trình độ.",
    category: "wellness",
    price: 399000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    providerId: "7",
    providerName: "Yoga Life",
    rating: 4.8,
    subscriberCount: 1876,
    features: ["Online livestream", "Buổi sáng 6h", "Replay 24h", "Cộng đồng"],
  },
  {
    id: "10",
    name: "Massage trị liệu",
    description:
      "4 buổi massage/tháng tại spa 5 sao. Giảm stress, thư giãn cơ thể.",
    category: "wellness",
    price: 1299000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
    providerId: "8",
    providerName: "Serenity Spa",
    rating: 5.0,
    subscriberCount: 876,
    features: [
      "4 buổi/tháng",
      "Đặt lịch linh hoạt",
      "Tinh dầu cao cấp",
      "Không gian riêng tư",
    ],
  },
  {
    id: "11",
    name: "Gói chăm sóc da",
    description:
      "Điều trị da mặt chuyên sâng 2 lần/tuần. Sử dụng sản phẩm cao cấp.",
    category: "wellness",
    price: 1999000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881",
    providerId: "9",
    providerName: "Beauty Lab",
    rating: 4.9,
    subscriberCount: 1234,
    features: [
      "8 buổi/tháng",
      "Sản phẩm cao cấp",
      "Chuyên gia tư vấn",
      "Không gian sang trọng",
    ],
  },

  // LEARNING
  {
    id: "12",
    name: "Tiếng Anh giao tiếp",
    description:
      "Học tiếng Anh 1-1 với giáo viên bản ngữ. 5 buổi/tuần, 30 phút/buổi.",
    category: "learning",
    price: 1499000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    providerId: "10",
    providerName: "English Academy",
    rating: 4.9,
    subscriberCount: 3421,
    features: [
      "Giáo viên bản ngữ",
      "1-on-1 online",
      "Lịch linh hoạt",
      "Tài liệu miễn phí",
    ],
  },
  {
    id: "13",
    name: "Lập trình Web cơ bản",
    description:
      "Khóa học 3 tháng từ zero đến hero. HTML, CSS, JavaScript và React.",
    category: "learning",
    price: 2999000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    providerId: "11",
    providerName: "Code Masters",
    rating: 4.8,
    subscriberCount: 2156,
    features: ["3 tháng học", "Project thực tế", "Mentor 1-1", "Certificate"],
  },
  {
    id: "14",
    name: "Thiền & Mindfulness",
    description:
      "Khóa học thiền định online. Giảm stress, tăng tập trung, sống tỉnh thức.",
    category: "learning",
    price: 499000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
    providerId: "12",
    providerName: "Mindful Living",
    rating: 4.9,
    subscriberCount: 1543,
    features: [
      "Video lessons",
      "Guided meditation",
      "Community",
      "Weekly live",
    ],
  },
  {
    id: "15",
    name: "Vẽ & Sáng tạo nghệ thuật",
    description:
      "Học vẽ từ cơ bản đến nâng cao. Mỗi tuần 1 bài học mới và challenge sáng tạo.",
    category: "learning",
    price: 799000,
    frequency: "monthly",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
    providerId: "13",
    providerName: "Art Studio",
    rating: 4.7,
    subscriberCount: 987,
    features: [
      "Bài học video",
      "Live critique",
      "Art supplies discount",
      "Gallery online",
    ],
  },
];

// Featured packages (top rated)
export const FEATURED_PACKAGES = MOCK_PACKAGES.filter(
  (pkg) => pkg.rating >= 4.8
).slice(0, 5);

// Get packages by category
export const getPackagesByCategory = (category: string) => {
  return MOCK_PACKAGES.filter((pkg) => pkg.category === category);
};

// Search packages
export const searchPackages = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return MOCK_PACKAGES.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(lowerQuery) ||
      pkg.description.toLowerCase().includes(lowerQuery) ||
      pkg.providerName.toLowerCase().includes(lowerQuery)
  );
};
