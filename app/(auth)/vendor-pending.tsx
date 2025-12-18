import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { AppTheme } from "@/constants/theme";

export default function VendorPendingScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
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
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        style={styles.background}
      >
        {/* Icon & Animation */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="hourglass-outline" size={80} color="#FFF" />
          </View>
          <View style={styles.pulse} />
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Tài khoản đang được xác minh</Text>
          <Text style={styles.subtitle}>
            Cảm ơn bạn đã đăng ký làm nhà cung cấp dịch vụ!
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={AppTheme.colors.primary} />
              <Text style={styles.infoText}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={AppTheme.colors.primary} />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={AppTheme.colors.primary} />
              <Text style={styles.infoText}>
                Đăng ký {daysSinceReg} ngày trước
              </Text>
            </View>
          </View>

          {/* Message */}
          <View style={styles.messageBox}>
            <Ionicons name="information-circle" size={24} color="#FF9800" />
            <Text style={styles.message}>
              Tài khoản của bạn đang trong quá trình xác minh. Thời gian xử lý thường
              từ <Text style={styles.highlight}>1-3 ngày làm việc</Text> kể từ ngày đăng ký.
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotComplete]}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Đăng ký thành công</Text>
                <Text style={styles.timelineDate}>
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotPending]}>
                <Ionicons name="time" size={16} color="#FF9800" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Đang xác minh</Text>
                <Text style={styles.timelineDate}>Đang xử lý...</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotFuture]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, styles.timelineTitleFuture]}>
                  Kích hoạt tài khoản
                </Text>
                <Text style={styles.timelineDate}>Sắp hoàn thành</Text>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>Cần hỗ trợ?</Text>
            <Text style={styles.contactText}>
              Liên hệ với chúng tôi qua email:{" "}
              <Text style={styles.contactEmail}>support@subme.com</Text>
            </Text>
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
    zIndex: 2,
  },
  pulse: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
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
  messageBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  highlight: {
    fontWeight: "700",
    color: "#FF9800",
  },
  timeline: {
    marginBottom: 24,
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotComplete: {
    backgroundColor: "#4CAF50",
  },
  timelineDotPending: {
    backgroundColor: "#FF9800",
  },
  timelineDotFuture: {
    backgroundColor: "#E0E0E0",
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E0E0E0",
    marginLeft: 15,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  timelineTitleFuture: {
    color: "#999",
  },
  timelineDate: {
    fontSize: 13,
    color: "#666",
  },
  contactBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  contactEmail: {
    fontWeight: "600",
    color: AppTheme.colors.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F44336",
    backgroundColor: "#FFF",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
});
