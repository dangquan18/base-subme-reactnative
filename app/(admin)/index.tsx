import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppTheme } from "@/constants/theme";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowLogoutModal(false);
    router.replace("/(auth)/welcome");
  };

  const adminMenuItems = [
    {
      title: "Quản lý vendor",
      icon: "people-outline",
      description: "Xem và quản lý tất cả Cửa hàng",
      onPress: () => {
        // TODO: Navigate to user management
        // Alert.alert("Thông báo", "Tính năng đang phát triển");
        router.push("/vendors");
      },
    },
    {
      title: "Quản lý gói dịch vụ",
      icon: "briefcase-outline",
      description: "Thêm, sửa, xóa gói dịch vụ",
      onPress: () => {
        // TODO: Navigate to package management
        // Alert.alert("Thông báo", "Tính năng đang phát triển");
        router.push("/plans");

      },
    },
    {
      title: "Quản lý đơn hàng",
      icon: "document-text-outline",
      description: "Xem và xử lý đơn hàng",
      onPress: () => {
        // TODO: Navigate to order management
        Alert.alert("Thông báo", "Tính năng đang phát triển");
      },
    },
    {
      title: "Thống kê",
      icon: "bar-chart-outline",
      description: "Xem báo cáo và thống kê",
      onPress: () => {
        // TODO: Navigate to statistics
        Alert.alert("Thông báo", "Tính năng đang phát triển");
      },
    },
    {
      title: "Cài đặt hệ thống",
      icon: "settings-outline",
      description: "Cấu hình hệ thống",
      onPress: () => {
        // TODO: Navigate to system settings
        Alert.alert("Thông báo", "Tính năng đang phát triển");
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header với Gradient */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#FFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.welcome}>Admin Dashboard</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        
        {/* Logout Button in Header */}
        <Pressable style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Menu Grid */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quản lý hệ thống</Text>
          <View style={styles.menuGrid}>
            {adminMenuItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={32} color="#667eea" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        type="danger"
        icon="log-out-outline"
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
  },
  welcome: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
  },
  userEmail: {
    fontSize: 13,
    color: "#FFF",
    opacity: 0.8,
    marginTop: 2,
  },
  menuContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  menuItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  menuDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
});