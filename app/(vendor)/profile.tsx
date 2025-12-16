import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
}

export default function VendorProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [showStoreInfo, setShowStoreInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, 
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }

      Alert.alert("Thành công", "Đổi mật khẩu thành công");
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: "person-outline",
      label: "Thông tin cửa hàng",
      onPress: () => setShowStoreInfo(!showStoreInfo),
    },
    {
      icon: "lock-closed-outline",
      label: "Đổi mật khẩu",
      onPress: () => setShowChangePassword(true),
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
      {/* HEADER */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  "https://ui-avatars.com/api/?name=" + user?.name,
              }}
              style={styles.avatar}
            />
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </Pressable>
          </View>

          <Text style={styles.userName}>{user?.name || "Vendor"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "vendor@example.com"}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="storefront"
              size={16}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.roleText}>Cửa hàng</Text>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => {
              const isStoreInfo = item.label === "Thông tin cửa hàng";

              return (
                <View key={index}>
                  <Pressable style={styles.menuItem} onPress={item.onPress}>
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
                      name={
                        isStoreInfo
                          ? showStoreInfo
                            ? "chevron-up"
                            : "chevron-down"
                          : "chevron-forward"
                      }
                      size={20}
                      color="#BDBDBD"
                    />
                  </Pressable>

                  {isStoreInfo && showStoreInfo && (
                    <View style={styles.dropdown}>
                      <View style={styles.dropdownRow}>
                        <Ionicons
                          name="call-outline"
                          size={18}
                          color="#757575"
                        />
                        <Text style={styles.dropdownText}>
                          {user?.phone || "Chưa cập nhật số điện thoại"}
                        </Text>
                      </View>

                      <View style={styles.dropdownRow}>
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color="#757575"
                        />
                        <Text style={styles.dropdownText}>
                          {user?.address || "Chưa cập nhật địa chỉ"}
                        </Text>
                      </View>
                    </View>
                  )}

                  {index < menuItems.length - 1 && (
                    <View style={styles.menuDivider} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* LOGOUT */}
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#F44336" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu cũ"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowChangePassword(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.confirmText}>
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#FFF" },

  profileCard: {
    backgroundColor: "#FFF",
    margin: 20,
    marginTop: -10,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    ...AppTheme.shadow.md,
  },

  avatarContainer: { position: "relative", marginBottom: 15 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFF",
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
    borderColor: "#FFF",
  },

  userName: { fontSize: 24, fontWeight: "bold", color: "#212121" },
  userEmail: { fontSize: 14, color: "#757575", marginBottom: 15 },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.primaryLight + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: { fontSize: 14, fontWeight: "600", color: AppTheme.colors.primary },

  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 12,
  },

  menuCard: {
    backgroundColor: "#FFF",
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

  menuLeft: { flexDirection: "row", alignItems: "center", flex: 1 },

  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primaryLight + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuLabel: { fontSize: 16, color: "#212121", fontWeight: "500" },

  menuDivider: { height: 1, backgroundColor: "#F5F5F5", marginLeft: 68 },

  dropdown: {
    backgroundColor: "#FAFAFA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 68,
    borderLeftWidth: 2,
    borderLeftColor: AppTheme.colors.primary + "40",
    gap: 10,
  },

  dropdownRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dropdownText: { fontSize: 14, color: "#424242", flex: 1 },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    ...AppTheme.shadow.sm,
  },

  logoutText: { fontSize: 16, fontWeight: "600", color: "#F44336" },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#BDBDBD",
    marginBottom: 30,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  inputGroup: { marginBottom: 15 },

  inputLabel: { fontSize: 14, color: "#424242", marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  cancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: "#757575", fontSize: 14 },

  confirmButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  confirmText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
