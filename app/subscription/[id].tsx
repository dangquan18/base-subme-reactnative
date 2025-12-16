import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Subscription, Review, DeliverySchedule } from "@/types";
import { subscriptionService } from "@/services/subscription.service";
import { reviewService } from "@/services/review.service";
import { deliveryService } from "@/services/delivery.service";

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliverySchedule[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  useEffect(() => {
    loadSubscription();
    loadReviews();
    loadDeliveries();
  }, [id]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getSubscriptionById(Number(id));
      setSubscription(data);
    } catch (error: any) {
      console.error("Error loading subscription:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đăng ký");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    try {
      const data = await subscriptionService.getSubscriptionById(Number(id));
      if (data.plan_id) {
        const reviewsData = await reviewService.getPlanReviews(data.plan_id);
        setReviews(reviewsData.reviews || []);
      }
    } catch (error) {
      console.error("Load reviews error:", error);
    }
  };
  const loadDeliveries = async () => {
    if (!id) return;
    setLoadingDeliveries(true);
    try {
      const data = await deliveryService.getSubscriptionDeliveries(Number(id), {
        limit: 10,
      });
      setDeliveries(data.schedules || []);
    } catch (error) {
      console.error("Load deliveries error:", error);
    } finally {
      setLoadingDeliveries(false);
    }
  };
  const handleSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!userComment.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nhận xét");
      return;
    }
    if (!subscription?.plan_id) return;

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        plan_id: subscription.plan_id,
        rating: userRating,
        comment: userComment.trim(),
      });
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!");
      setReviewModalVisible(false);
      setUserRating(0);
      setUserComment("");
      loadReviews();
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "expired":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "pending_payment":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "expired":
        return "Đã hết hạn";
      case "cancelled":
        return "Đã hủy";
      case "pending_payment":
        return "Chờ thanh toán";
      default:
        return status;
    }
  };

  const getDeliveryStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "in_transit":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "missed":
        return "Giao lỡ";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "confirmed":
        return "#2196F3";
      case "in_transit":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      case "missed":
        return "#F44336";
      case "cancelled":
        return "#9E9E9E";
      default:
        return "#666";
    }
  };

  const getTimeSlotText = (timeSlot: string) => {
    switch (timeSlot) {
      case "morning":
        return "Sáng (7h - 11h)";
      case "afternoon":
        return "Chiều (13h - 17h)";
      case "evening":
        return "Tối (18h - 21h)";
      case "anytime":
        return "Cả ngày";
      default:
        return timeSlot;
    }
  };

  const formatDeliveryDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai";
    } else {
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Hủy đăng ký",
      "Bạn có chắc muốn hủy đăng ký này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đăng ký",
          style: "destructive",
          onPress: async () => {
            try {
              await subscriptionService.cancelSubscription(String(id));
              Alert.alert("Thành công", "Đã hủy đăng ký", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert("Lỗi", error.response?.data?.message || "Không thể hủy đăng ký");
            }
          },
        },
      ]
    );
  };

  const handleRenewSubscription = async () => {
    try {
      await subscriptionService.renewSubscription(String(id));
      Alert.alert("Thành công", "Đã gia hạn đăng ký");
      loadSubscription();
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể gia hạn đăng ký");
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;

    try {
      await subscriptionService.updateSubscription(String(id), {
        auto_renew: !subscription.auto_renew,
      });
      Alert.alert("Thành công", `Đã ${subscription.auto_renew ? "tắt" : "bật"} tự động gia hạn`);
      loadSubscription();
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể cập nhật");
    }
  };

  if (loading || !subscription) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          
          {(subscription.plan?.imageUrl || subscription.plan?.image) ? (
            <Image
              source={{ uri: subscription.plan.imageUrl || subscription.plan.image }}
              style={styles.packageImage}
            />
          ) : (
            <View style={[styles.packageImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
            </View>
          )}
          
          <Text style={styles.packageName}>{subscription.plan?.name}</Text>
          <Text style={styles.providerName}>{subscription.plan?.vendor?.name}</Text>
          
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(subscription.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(subscription.status) },
              ]}
            >
              {getStatusText(subscription.status)}
            </Text>
          </View>
        </View>

        {/* Subscription Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đăng ký</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar-outline" size={20} color="#667eea" />
                <Text style={styles.infoLabelText}>Ngày bắt đầu</Text>
              </View>
              <Text style={styles.infoValue}>
                {formatDate(subscription.start_date)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar" size={20} color="#667eea" />
                <Text style={styles.infoLabelText}>Ngày hết hạn</Text>
              </View>
              <Text style={styles.infoValue}>
                {formatDate(subscription.end_date)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="time-outline" size={20} color="#667eea" />
                <Text style={styles.infoLabelText}>Thời hạn</Text>
              </View>
              <Text style={styles.infoValue}>
                {subscription.plan?.duration_value} {subscription.plan?.duration_unit}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="card-outline" size={20} color="#667eea" />
                <Text style={styles.infoLabelText}>Giá</Text>
              </View>
              <Text style={[styles.infoValue, styles.priceText]}>
                {formatPrice(subscription.plan?.price || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        {subscription.plan?.features && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tính năng</Text>
            <View style={styles.featuresCard}>
              <Text style={styles.featuresText}>
                {subscription.plan.features}
              </Text>
            </View>
          </View>
        )}

        {/* Auto Renew */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn</Text>
          <Pressable
            style={styles.autoRenewCard}
            onPress={handleToggleAutoRenew}
          >
            <View style={styles.autoRenewInfo}>
              <Ionicons name="refresh-outline" size={24} color="#667eea" />
              <View style={styles.autoRenewText}>
                <Text style={styles.autoRenewTitle}>Tự động gia hạn</Text>
                <Text style={styles.autoRenewDescription}>
                  Tự động thanh toán khi hết hạn
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                subscription.auto_renew && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  subscription.auto_renew && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* Payment History */}
        {subscription.payments && subscription.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
            
            {subscription.payments.map((payment) => (
              <View key={payment.id} style={styles.paymentHistoryCard}>
                <View style={styles.paymentHistoryHeader}>
                  <View style={styles.paymentHistoryInfo}>
                    <Text style={styles.paymentHistoryAmount}>
                      {formatPrice(payment.amount)}
                    </Text>
                    <Text style={styles.paymentHistoryDate}>
                      {formatDate(payment.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.paymentHistoryStatus,
                      {
                        backgroundColor:
                          payment.status === "success"
                            ? "#4CAF5020"
                            : payment.status === "pending"
                            ? "#FF980020"
                            : "#F4433620",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentHistoryStatusText,
                        {
                          color:
                            payment.status === "success"
                              ? "#4CAF50"
                              : payment.status === "pending"
                              ? "#FF9800"
                              : "#F44336",
                        },
                      ]}
                    >
                      {payment.status === "success"
                        ? "Thành công"
                        : payment.status === "pending"
                        ? "Đang xử lý"
                        : "Thất bại"}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentHistoryDetails}>
                  <View style={styles.paymentHistoryDetail}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    <Text style={styles.paymentHistoryDetailText}>
                      {payment.method}
                    </Text>
                  </View>
                  <View style={styles.paymentHistoryDetail}>
                    <Ionicons name="receipt-outline" size={16} color="#666" />
                    <Text style={styles.paymentHistoryDetailText}>
                      {payment.transaction_id}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Schedule */}
        {subscription.status === "active" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch giao hàng</Text>
            
            {loadingDeliveries ? (
              <View style={styles.deliveryLoadingCard}>
                <ActivityIndicator color="#667eea" />
                <Text style={styles.deliveryLoadingText}>
                  Đang tải lịch giao hàng...
                </Text>
              </View>
            ) : deliveries.length > 0 ? (
              deliveries.map((delivery, index) => (
                <View key={delivery.id} style={styles.deliveryCard}>
                  <View style={styles.deliveryDateBadge}>
                    <Text style={styles.deliveryDateText}>
                      {formatDeliveryDate(delivery.scheduled_date)}
                    </Text>
                    <Text style={styles.deliveryTimeText}>
                      {getTimeSlotText(delivery.time_slot)}
                    </Text>
                  </View>
                  
                  <View style={styles.deliveryContent}>
                    <View style={styles.deliveryInfo}>
                      <View style={styles.deliveryInfoRow}>
                        <Ionicons name="location-outline" size={18} color="#666" />
                        <Text style={styles.deliveryAddress} numberOfLines={2}>
                          {delivery.delivery_address}
                        </Text>
                      </View>
                      
                      {delivery.delivery_note && (
                        <View style={styles.deliveryInfoRow}>
                          <Ionicons name="document-text-outline" size={18} color="#666" />
                          <Text style={styles.deliveryNote} numberOfLines={2}>
                            {delivery.delivery_note}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View
                      style={[
                        styles.deliveryStatusBadge,
                        {
                          backgroundColor:
                            getDeliveryStatusColor(delivery.status) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.deliveryStatusText,
                          {
                            color: getDeliveryStatusColor(delivery.status),
                          },
                        ]}
                      >
                        {getDeliveryStatusText(delivery.status)}
                      </Text>
                    </View>
                  </View>
                  
                  {delivery.status === "delivered" && delivery.delivered_at && (
                    <View style={styles.deliveredInfo}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.deliveredText}>
                        Đã giao lúc {new Date(delivery.delivered_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  )}
                  
                  {index < deliveries.length - 1 && (
                    <View style={styles.deliveryDivider} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyDeliveries}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptyDeliveriesText}>
                  Chưa có lịch giao hàng
                </Text>
                <Text style={styles.emptyDeliveriesSubtext}>
                  Lịch giao hàng sẽ được tạo sau khi thanh toán
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reviews & Ratings */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>
            {subscription.status === "active" && (
              <Pressable
                style={styles.writeReviewButton}
                onPress={() => setReviewModalVisible(true)}
              >
                <Ionicons name="create-outline" size={18} color="#667eea" />
                <Text style={styles.writeReviewText}>Viết đánh giá</Text>
              </Pressable>
            )}
          </View>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader2}>
                  <View style={styles.reviewUserInfo}>
                    <View style={styles.reviewAvatar}>
                      <Ionicons name="person" size={20} color="#667eea" />
                    </View>
                    <View>
                      <Text style={styles.reviewUserName}>
                        {review.user?.name || "Người dùng"}
                      </Text>
                      <View style={styles.reviewRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? "star" : "star-outline"}
                            size={14}
                            color="#FFB800"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyReviews}>
              <Ionicons name="chatbox-outline" size={48} color="#ccc" />
              <Text style={styles.emptyReviewsText}>
                Chưa có đánh giá nào
              </Text>
              {subscription.status === "active" && (
                <Text style={styles.emptyReviewsSubtext}>
                  Hãy là người đầu tiên đánh giá gói này
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {subscription.status === "active" && (
            <>
              <Pressable
                style={styles.actionButton}
                onPress={handleRenewSubscription}
              >
                <Ionicons name="refresh-outline" size={20} color="#667eea" />
                <Text style={styles.actionButtonText}>Gia hạn ngay</Text>
              </Pressable>

              <Pressable
                style={styles.actionButtonSecondary}
                onPress={handleCancelSubscription}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#F44336"
                />
                <Text
                  style={[
                    styles.actionButtonSecondaryText,
                    { color: "#F44336" },
                  ]}
                >
                  Hủy đăng ký
                </Text>
              </Pressable>
            </>
          )}

          {subscription.status === "expired" && (
            <Pressable
              style={styles.actionButton}
              onPress={handleRenewSubscription}
            >
              <Ionicons name="refresh-outline" size={20} color="#667eea" />
              <Text style={styles.actionButtonText}>Đăng ký lại</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viết đánh giá</Text>
              <Pressable onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.ratingLabel}>Đánh giá của bạn</Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setUserRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= userRating ? "star" : "star-outline"}
                      size={32}
                      color="#FFB800"
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={styles.commentLabel}>Nhận xét của bạn</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ trải nghiệm của bạn về gói này..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={userComment}
                onChangeText={setUserComment}
                textAlignVertical="top"
              />

              <Pressable
                style={[
                  styles.submitButton,
                  submittingReview && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    zIndex: 10,
  },
  packageImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 16,
  },
  placeholderImage: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  packageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabelText: {
    fontSize: 15,
    color: "#666",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginVertical: 8,
  },
  priceText: {
    color: "#667eea",
    fontSize: 16,
  },
  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  featuresText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  autoRenewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoRenewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoRenewText: {
    flex: 1,
    marginLeft: 8,
  },
  autoRenewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  autoRenewDescription: {
    fontSize: 13,
    color: "#666",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#667eea",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  paymentHistoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  paymentHistoryInfo: {
    flex: 1,
  },
  paymentHistoryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  paymentHistoryDate: {
    fontSize: 13,
    color: "#666",
  },
  paymentHistoryStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentHistoryStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  paymentHistoryDetails: {
    flexDirection: "row",
    gap: 16,
  },
  paymentHistoryDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentHistoryDetailText: {
    fontSize: 13,
    color: "#666",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#667eea",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  // Delivery Schedule styles
  deliveryLoadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  deliveryLoadingText: {
    fontSize: 14,
    color: "#666",
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deliveryDateBadge: {
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  deliveryDateText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  deliveryTimeText: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  deliveryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
    gap: 8,
    marginRight: 12,
  },
  deliveryInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  deliveryNote: {
    fontSize: 13,
    color: "#666",
    flex: 1,
    fontStyle: "italic",
    lineHeight: 18,
  },
  deliveryStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  deliveryStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deliveredInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  deliveredText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginTop: 16,
  },
  emptyDeliveries: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyDeliveriesText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },
  emptyDeliveriesSubtext: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 4,
    textAlign: "center",
  },
  // Review styles
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyReviews: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyReviewsText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },
  emptyReviewsSubtext: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  commentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#333",
    minHeight: 120,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
