import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AdminScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/welcome");
          },
        },
      ]
    );
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={32} color="#667eea" />
          <View style={styles.headerText}>
            <Text style={styles.welcome}>Chào mừng Admin</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Menu Grid */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Quản lý hệ thống</Text>
        <View style={styles.menuGrid}>
          {adminMenuItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={24} color="#667eea" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={styles.footer}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOutText}>Đăng xuất</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  welcome: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  menuContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: "#ff4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});