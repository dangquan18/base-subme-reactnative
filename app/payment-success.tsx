import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { paymentService } from "@/services/payment.service";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      
      // Check payment status from URL params
      const status = params.status as string;
      
      if (status === 'success') {
        // Payment successful
        setPaymentData({ success: true });
        
        // Start success animation
        scale.value = withSpring(1, { damping: 10 });
        checkScale.value = withDelay(300, withSpring(1, { damping: 12 }));
      } else {
        setError('Thanh toán thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      setError(error.response?.data?.message || 'Không thể xác thực thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang xác thực thanh toán...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorCircle}>
            <Ionicons name="close" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Thanh toán thất bại</Text>
          <Text style={styles.message}>{error}</Text>
        </View>
        <View style={styles.footer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)/subscriptions')}
          >
            <Text style={styles.primaryButtonText}>Thử lại</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View style={[styles.successCircle, circleStyle]}>
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark" size={64} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.message}>
          Cảm ơn bạn đã đăng ký. Gói dịch vụ của bạn sẽ bắt đầu ngay.
        </Text>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={24} color="#667eea" />
            <Text style={styles.infoLabel}>Ngày thanh toán</Text>
            <Text style={styles.infoValue}>
              {paymentData ? new Date(paymentData.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="card-outline" size={24} color="#667eea" />
            <Text style={styles.infoLabel}>Số tiền</Text>
            <Text style={styles.infoValue}>
              {paymentData ? formatPrice(paymentData.amount) : '0 đ'}
            </Text>
          </View>
        </View>

        {/* Receipt */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Mã giao dịch</Text>
            <Text style={styles.receiptValue}>
              #{paymentData?.id || Date.now().toString().slice(-8)}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Gói dịch vụ</Text>
            <Text style={styles.receiptValue}>
              {paymentData?.subscription?.package?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Trạng thái</Text>
            <Text style={[styles.receiptValue, { color: '#4CAF50' }]}>
              {paymentData?.status === 'success' ? 'Thành công' : 'Đang xử lý'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/subscriptions")}
        >
          <Text style={styles.primaryButtonText}>Xem gói của tôi</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCards: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: "#666",
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});
