import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { packageService } from "@/services/package.service";
import { subscriptionService } from "@/services/subscription.service";
import { paymentService } from "@/services/payment.service";
import { Package } from "@/types";

export default function CheckoutScreen() {
  const router = useRouter();
  const { packageId } = useLocalSearchParams();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("VNPay");
  const [autoRenew, setAutoRenew] = useState(true);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      const pkg = await packageService.getPackageById(Number(packageId));
      setPackageData(pkg);
    } catch (error) {
      console.error("Error loading package:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin gói dịch vụ");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: "VNPay", name: "VNPay", icon: "card-outline", color: "#1A73E8" },
    { id: "MoMo", name: "MoMo", icon: "wallet-outline", color: "#A50064" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const pollPaymentStatus = async (subscriptionId: number, packageName: string, amount: number) => {
    let pollCount = 0;
    const maxPolls = 300; // 5 minutes maximum (300 seconds)

    const interval = setInterval(async () => {
      try {
        pollCount++;
        
        // Check subscription status
        const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
        
        console.log(`Polling payment status (${pollCount}/${maxPolls}):`, subscription.status);

        if (subscription.status === 'active') {
          // Payment successful!
          clearInterval(interval);
          setPollingInterval(null);
          setProcessing(false);

          router.replace({
            pathname: "/payment-success",
            params: {
              status: "success",
              subscriptionId: subscriptionId.toString(),
              amount: amount.toString(),
              packageName: packageName,
            },
          });
        } else if (subscription.status === 'cancelled' || subscription.status === 'expired') {
          // Payment failed or cancelled
          clearInterval(interval);
          setPollingInterval(null);
          setProcessing(false);
          
          Alert.alert(
            "Thanh toán thất bại",
            "Giao dịch đã bị hủy hoặc thất bại. Vui lòng thử lại.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setPollingInterval(null);
          setProcessing(false);
          
          Alert.alert(
            "Hết thời gian chờ",
            "Không nhận được kết quả thanh toán. Vui lòng kiểm tra lại trong mục đăng ký của bạn.",
            [{ text: "OK", onPress: () => router.replace("/(tabs)/subscriptions") }]
          );
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
        // Continue polling even if there's an error
      }
    }, 1000); // Poll every 1 second

    setPollingInterval(interval);
  };

  const handlePayment = async () => {
    if (!packageData) return;

    try {
      setProcessing(true);

      // Step 1: Create subscription
      const subscriptionResult = await subscriptionService.createSubscription({
        plan_id: packageData.id,
        payment_method: selectedPayment,
        auto_renew: autoRenew,
      });

      if (!subscriptionResult.success) {
        throw new Error(subscriptionResult.message);
      }

      // Step 2: Process payment (get VNPay URL)
      const paymentResult = await paymentService.processPayment({
        subscription_id: subscriptionResult.subscription.id,
        amount: Number(packageData.price),
        payment_method: selectedPayment,
        return_url: "exp://localhost:8081/payment-success", // For development
      });

      if (paymentResult.success && paymentResult.payment_url) {
        // Open VNPay URL
        const supported = await Linking.canOpenURL(paymentResult.payment_url);
        if (supported) {
          await Linking.openURL(paymentResult.payment_url);
          
          // Start polling for payment status
          pollPaymentStatus(
            subscriptionResult.subscription.id,
            packageData.name,
            Number(packageData.price)
          );

          Alert.alert(
            "Thanh toán",
            "Vui lòng hoàn tất thanh toán trên trang VNPay. Hệ thống sẽ tự động cập nhật khi thanh toán thành công.",
            [{ text: "OK" }]
          );
        } else {
          throw new Error("Không thể mở link thanh toán");
        }
      } else {
        throw new Error("Không thể tạo link thanh toán");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      
      // Clear polling if there's an error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      Alert.alert(
        "Lỗi thanh toán",
        error.response?.data?.message || error.message || "Không thể xử lý thanh toán"
      );
    } finally {
      // Don't set processing to false here, let polling handle it
      if (!pollingInterval) {
        setProcessing(false);
      }
    }
  };

  const handleTestPayment = async () => {
    if (!packageData) return;

    const confirmed = confirm("Bạn muốn test thanh toán thành công ngay?");
    if (!confirmed) return;

    try {
      setProcessing(true);

      // Step 1: Create subscription
      const subscriptionResult = await subscriptionService.createSubscription({
        plan_id: packageData.id,
        payment_method: "VNPay",
        auto_renew: autoRenew,
      });

      if (!subscriptionResult.success) {
        throw new Error(subscriptionResult.message);
      }

      // Step 2: Create test payment (marks as success in DB)
      const paymentResult = await paymentService.testPayment({
        subscription_id: subscriptionResult.subscription.id,
        amount: Number(packageData.price),
      });

      if (!paymentResult.success) {
        throw new Error("Không thể tạo test payment");
      }

      // Navigate to success screen
      router.replace({
        pathname: "/payment-success",
        params: {
          status: "success",
          subscriptionId: subscriptionResult.subscription.id,
          amount: packageData.price.toString(),
          packageName: packageData.name,
        },
      });
    } catch (error: any) {
      console.error("Test payment error:", error);
      alert(error.response?.data?.message || error.message || "Không thể tạo test payment");
    } finally {
      setProcessing(false);
    }
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
        {/* Package Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin gói</Text>
          <View style={styles.packageCard}>
            <Text style={styles.packageName}>{packageData.name}</Text>
            <Text style={styles.packageProvider}>{packageData.vendor.name}</Text>
            <Text style={styles.packageDuration}>
              Thời hạn: {packageData.duration_value} {packageData.duration_unit}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment === method.id && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentInfo}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={method.color}
                />
                <Text style={styles.paymentName}>{method.name}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPayment === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Auto Renew */}
        <View style={styles.section}>
          <Pressable
            style={styles.autoRenewCard}
            onPress={() => setAutoRenew(!autoRenew)}
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
            <View style={[styles.toggle, autoRenew && styles.toggleActive]}>
              <View
                style={[
                  styles.toggleThumb,
                  autoRenew && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt thanh toán</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giá gốc</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(packageData.price)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalPrice}>{formatPrice(packageData.price)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPriceValue}>{formatPrice(packageData.price)}</Text>
        </View>
        <Pressable 
          style={[styles.payButton, processing && styles.payButtonDisabled]} 
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Xác nhận thanh toán</Text>
          )}
        </Pressable>
        
        {/* Test Payment Button */}
        <Pressable 
          style={[styles.testButton, processing && styles.testButtonDisabled]} 
          onPress={handleTestPayment}
          disabled={processing}
        >
          <Ionicons name="flash" size={16} color="#FF9800" />
          <Text style={styles.testButtonText}>Test thanh toán</Text>
        </Pressable>
      </View>
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
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  packageCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  packageProvider: {
    fontSize: 14,
    color: "#667eea",
  },
  durationCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  durationCardSelected: {
    borderColor: "#667eea",
    backgroundColor: "#EEF2FF",
  },
  durationInfo: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  durationPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  discountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  textSelected: {
    color: "#667eea",
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentCardSelected: {
    borderColor: "#667eea",
    backgroundColor: "#EEF2FF",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#667eea",
  },
  autoRenewCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoRenewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  autoRenewText: {
    flex: 1,
  },
  autoRenewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  autoRenewDescription: {
    fontSize: 13,
    color: "#666",
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#CCC",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#667eea",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  summaryDiscount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF3B30",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  footerPriceLabel: {
    fontSize: 15,
    color: "#666",
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#667eea",
  },
  payButton: {
    backgroundColor: "#667eea",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: "#FFF3E0",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: "#FF9800",
    fontSize: 15,
    fontWeight: "600",
  },
});
