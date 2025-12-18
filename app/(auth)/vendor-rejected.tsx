import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { AppTheme } from "@/constants/theme";

export default function VendorRejectedScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const handleContactSupport = () => {
    const email = "support@subme.com";
    const subject = encodeURIComponent("Hỗ trợ về tài khoản bị từ chối");
    const body = encodeURIComponent(
      `Xin chào,\n\nTôi là ${user?.name} (${user?.email}).\nTài khoản vendor của tôi đã bị từ chối. Vui lòng cung cấp thêm thông tin chi tiết.\n\nCảm ơn!`
    );
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  // Tính số ngày kể từ khi đăng ký
  const getDaysSinceRegistration = () => {
    if (!user?.createdAt) return 0;
    const createdDate = new Date(user.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceReg = getDaysSinceRegistration();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#D32F2F", "#F44336"]}
        style={styles.background}
      >
        {/* Icon & Animation */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="close-circle-outline" size={80} color="#FFF" />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Tài khoản không được phê duyệt</Text>
          <Text style={styles.subtitle}>
            Rất tiếc, tài khoản vendor của bạn đã bị từ chối
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#D32F2F" />
              <Text style={styles.infoText}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#D32F2F" />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#D32F2F" />
              <Text style={styles.infoText}>
                Đăng ký {daysSinceReg} ngày trước
              </Text>
            </View>
          </View>

          {/* Warning Message */}
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <Text style={styles.warningText}>
              Tài khoản của bạn đã bị từ chối bởi quản trị viên. 
              Bạn không thể sử dụng các tính năng vendor trên hệ thống.
            </Text>
          </View>

          {/* Reasons Box */}
          <View style={styles.reasonsBox}>
            <Text style={styles.reasonsTitle}>Có thể do các lý do sau:</Text>
            <View style={styles.reasonItem}>
              <Ionicons name="ellipse" size={8} color="#666" />
              <Text style={styles.reasonText}>
                Thông tin đăng ký không chính xác hoặc không đầy đủ
              </Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="ellipse" size={8} color="#666" />
              <Text style={styles.reasonText}>
                Vi phạm điều khoản dịch vụ của nền tảng
              </Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="ellipse" size={8} color="#666" />
              <Text style={styles.reasonText}>
                Dịch vụ cung cấp không phù hợp với hệ thống
              </Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="ellipse" size={8} color="#666" />
              <Text style={styles.reasonText}>
                Lý do khác được nêu rõ trong email thông báo
              </Text>
            </View>
          </View>

          {/* Contact Box */}
          <View style={styles.contactBox}>
            <Ionicons name="mail-outline" size={32} color={AppTheme.colors.primary} />
            <Text style={styles.contactTitle}>Cần hỗ trợ?</Text>
            <Text style={styles.contactText}>
              Vui lòng liên hệ với chúng tôi để biết thêm chi tiết về quyết định này
            </Text>
            <Pressable style={styles.contactButton} onPress={handleContactSupport}>
              <Ionicons name="mail" size={20} color="#FFF" />
              <Text style={styles.contactButtonText}>Liên hệ hỗ trợ</Text>
            </Pressable>
            <Text style={styles.contactEmail}>support@subme.com</Text>
          </View>

          {/* Alternative */}
          <View style={styles.alternativeBox}>
            <Text style={styles.alternativeTitle}>Bạn vẫn có thể:</Text>
            <View style={styles.alternativeItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.alternativeText}>
                Sử dụng app như một khách hàng thông thường
              </Text>
            </View>
            <View style={styles.alternativeItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.alternativeText}>
                Đăng ký lại với thông tin chính xác hơn
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: "#F5F6FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  reasonsBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  reasonsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  contactBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    marginBottom: 8,
  },
  contactButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  contactEmail: {
    fontSize: 14,
    color: AppTheme.colors.primary,
    fontWeight: "600",
  },
  alternativeBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  alternativeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  alternativeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  alternativeText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  logoutText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
});
