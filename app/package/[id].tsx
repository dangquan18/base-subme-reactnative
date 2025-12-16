import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { packageService } from "@/services/package.service";
import { reviewService } from "@/services/review.service";
import { Package, Review } from "@/types";

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackageDetail();
  }, [id]);

  const loadPackageDetail = async () => {
    try {
      setLoading(true);
      // Load package data first
      const pkgData = await packageService.getPackageById(Number(id));
      setPackageData(pkgData);
      
      // Try to load reviews, but don't fail if it errors
      try {
        const reviewsData = await reviewService.getPlanReviews(Number(id), { limit: 5 });
        setReviews(reviewsData?.reviews || []);
      } catch (reviewError) {
        console.error("Error loading reviews (non-critical):", reviewError);
        setReviews([]);
      }
    } catch (error) {
      console.error("Error loading package detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin gói dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  const getFeatures = (featuresString?: string) => {
    if (!featuresString) return [];
    return featuresString.split(",").map(f => f.trim());
  };

  if (loading || !packageData) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 16, color: "#666" }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        {packageData.image ? (
          <Image
            source={{ uri: packageData.image }}
            style={styles.headerImage}
            defaultSource={require("@/assets/images/partial-react-logo.png")}
          />
        ) : (
          <View style={[styles.headerImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={64} color="#ccc" />
          </View>
        )}

        {/* Content */}
        <View style={styles.detailContent}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.packageName}>{packageData.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#FFC107" />
                <Text style={styles.ratingText}>{Number(packageData.average_rating || 0).toFixed(1)}</Text>
              </View>
              <Text style={styles.subscriberText}>
                {packageData.subscriber_count}+ người đăng ký
              </Text>
            </View>
          </View>

          {/* Provider */}
          <View style={styles.providerSection}>
            <Ionicons name="storefront-outline" size={20} color="#667eea" />
            <Text style={styles.providerName}>{packageData.vendor.name}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{packageData.description}</Text>
          </View>

          {/* Features */}
          {packageData.features && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quyền lợi</Text>
              {getFeatures(packageData.features).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Duration Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời hạn gói</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {packageData.duration_value} {packageData.duration_unit}
              </Text>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              {reviews.length > 0 && (
                <Pressable>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </Pressable>
              )}
            </View>
            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>Chưa có đánh giá nào</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUserName}>{review.user.name}</Text>
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
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
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Giá gói</Text>
          <Text style={styles.price}>
            {formatPrice(packageData.price)}/{packageData.duration_value} {packageData.duration_unit}
          </Text>
        </View>
        <Pressable
          style={styles.subscribeButton}
          onPress={() => router.push(`/checkout?packageId=${packageData.id}` as any)}
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
