import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Package } from "@/types";

// Mock data - in real app, fetch from API
const MOCK_PACKAGE: Package = {
  id: "1",
  name: "Cà phê sáng mỗi ngày",
  description:
    "Bắt đầu ngày mới với ly cà phê ngon, pha chế từ hạt cà phê Arabica cao cấp. Bạn có thể chọn các loại đồ uống yêu thích và thay đổi linh hoạt mỗi ngày.",
  category: "coffee",
  price: 299000,
  frequency: "daily",
  image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
  providerId: "1",
  providerName: "The Coffee House",
  rating: 4.8,
  subscriberCount: 1234,
  features: [
    "Free delivery trong bán kính 3km",
    "Chọn size: S, M, L",
    "Đổi món linh hoạt",
    "Giao hàng đúng giờ",
    "Tích điểm thưởng",
  ],
  deliveryTime: "7:00 - 9:00 sáng",
};

const REVIEWS = [
  {
    id: "1",
    userName: "Nguyễn Văn A",
    rating: 5,
    comment: "Cà phê rất ngon, giao hàng đúng giờ. Rất hài lòng!",
    date: "2 ngày trước",
  },
  {
    id: "2",
    userName: "Trần Thị B",
    rating: 4,
    comment: "Chất lượng ổn, giá cả hợp lý",
    date: "1 tuần trước",
  },
];

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <Image
          source={{ uri: MOCK_PACKAGE.image }}
          style={styles.headerImage}
          defaultSource={require("@/assets/images/partial-react-logo.png")}
        />

        {/* Content */}
        <View style={styles.detailContent}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.packageName}>{MOCK_PACKAGE.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#FFC107" />
                <Text style={styles.ratingText}>{MOCK_PACKAGE.rating}</Text>
              </View>
              <Text style={styles.subscriberText}>
                {MOCK_PACKAGE.subscriberCount}+ người đăng ký
              </Text>
            </View>
          </View>

          {/* Provider */}
          <View style={styles.providerSection}>
            <Ionicons name="storefront-outline" size={20} color="#667eea" />
            <Text style={styles.providerName}>{MOCK_PACKAGE.providerName}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{MOCK_PACKAGE.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quyền lợi</Text>
            {MOCK_PACKAGE.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Delivery Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian giao hàng</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{MOCK_PACKAGE.deliveryTime}</Text>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <Pressable>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </Pressable>
            </View>
            {REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUserName}>{review.userName}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? "star" : "star-outline"}
                      size={14}
                      color="#FFC107"
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Giá gói</Text>
          <Text style={styles.price}>
            {formatPrice(MOCK_PACKAGE.price)}/tháng
          </Text>
        </View>
        <Pressable
          style={styles.subscribeButton}
          onPress={() => router.push("/checkout" as any)}
        >
          <Text style={styles.subscribeButtonText}>Đăng ký ngay</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  headerImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#F5F5F5",
  },
  detailContent: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  packageName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subscriberText: {
    fontSize: 14,
    color: "#666",
  },
  providerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 24,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#666",
  },
  reviewCard: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  reviewDate: {
    fontSize: 13,
    color: "#999",
  },
  reviewRating: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    gap: 16,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subscribeButton: {
    flex: 1,
    backgroundColor: "#667eea",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
