import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PAYMENT_METHODS } from "@/constants/categories";

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState("momo");
  const [selectedDuration, setSelectedDuration] = useState<
    "weekly" | "monthly"
  >("monthly");
  const [autoRenew, setAutoRenew] = useState(true);

  const packageInfo = {
    name: "Cà phê sáng mỗi ngày",
    provider: "The Coffee House",
    basePrice: 299000,
  };

  const durations = [
    { id: "weekly", label: "1 tuần", discount: 0, price: 299000 },
    { id: "monthly", label: "1 tháng", discount: 10, price: 269100 },
  ];

  const selectedPrice = durations.find((d) => d.id === selectedDuration)!;
  const totalPrice = selectedPrice.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handlePayment = () => {
    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn có chắc muốn thanh toán ${formatPrice(totalPrice)}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            // TODO: Process payment
            router.push("/payment-success" as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Package Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin gói</Text>
          <View style={styles.packageCard}>
            <Text style={styles.packageName}>{packageInfo.name}</Text>
            <Text style={styles.packageProvider}>{packageInfo.provider}</Text>
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn kỳ hạn</Text>
          {durations.map((duration) => (
            <Pressable
              key={duration.id}
              style={[
                styles.durationCard,
                selectedDuration === duration.id && styles.durationCardSelected,
              ]}
              onPress={() => setSelectedDuration(duration.id as any)}
            >
              <View style={styles.durationInfo}>
                <Text
                  style={[
                    styles.durationLabel,
                    selectedDuration === duration.id && styles.textSelected,
                  ]}
                >
                  {duration.label}
                </Text>
                {duration.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{duration.discount}%
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.durationPrice,
                  selectedDuration === duration.id && styles.textSelected,
                ]}
              >
                {formatPrice(duration.price)}
              </Text>
              <View style={styles.radioButton}>
                {selectedDuration === duration.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((method) => (
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
                {formatPrice(packageInfo.basePrice)}
              </Text>
            </View>
            {selectedPrice.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá</Text>
                <Text style={styles.summaryDiscount}>
                  -{formatPrice(packageInfo.basePrice - selectedPrice.price)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPriceValue}>{formatPrice(totalPrice)}</Text>
        </View>
        <Pressable style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Xác nhận thanh toán</Text>
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
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  footerPriceLabel: {
    fontSize: 14,
    color: "#666",
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  payButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
