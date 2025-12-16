import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { AppTheme } from "@/constants/theme";

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
}

export default function VendorProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: "person-outline",
      label: "Thông tin cửa hàng",
      onPress: () => {},
    },
    {
      icon: "settings-outline",
      label: "Cài đặt",
      onPress: () => {},
    },
    {
      icon: "help-circle-outline",
      label: "Trung tâm trợ giúp",
      onPress: () => {},
    },
    {
      icon: "document-text-outline",
      label: "Điều khoản dịch vụ",
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  "https://ui-avatars.com/api/?name=" + user?.name,
              }}
              style={styles.avatar}
            />
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{user?.name || "Vendor"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "vendor@example.com"}
          </Text>
          <View style={styles.roleBadge}>
            <Ionicons name="storefront" size={16} color={AppTheme.colors.primary} />
            <Text style={styles.roleText}>Cửa hàng</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <View key={index}>
                <Pressable
                  style={styles.menuItem}
                  onPress={item.onPress}
                  android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={AppTheme.colors.primary}
                      />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#BDBDBD"
                  />
                </Pressable>
                {index < menuItems.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleSignOut}
            android_ripple={{ color: "rgba(244, 67, 54, 0.1)" }}
          >
            <Ionicons name="log-out-outline" size={22} color="#F44336" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: -10,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    ...AppTheme.shadow.md,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: AppTheme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 15,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.primaryLight + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppTheme.colors.primary,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    ...AppTheme.shadow.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primaryLight + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: "#212121",
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    ...AppTheme.shadow.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#BDBDBD",
    marginTop: 10,
    marginBottom: 30,
  },
});
