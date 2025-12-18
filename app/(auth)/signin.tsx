import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, reloadUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert("Lỗi\n\nVui lòng nhập đầy đủ thông tin");
      } else {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      }
      return;
    }

    setLoading(true);
    try {
      const role = await signIn(email, password);
      console.log("🔍 Role from signIn:", role);
      
      // Check role to determine user type
      if (role === "vendor") {
        // User is a vendor - get detailed vendor info
        try {
          const { vendorService } = await import("@/services/vendor.service");
          const vendorInfo = await vendorService.getVendorInfo();
          
          console.log("✅ Vendor info:", vendorInfo);
          
          // Update user data with vendor info from API
          const { tokenManager } = await import("@/utils/storage");
          await tokenManager.setUser({
            id: vendorInfo.id,
            name: vendorInfo.name,
            email: vendorInfo.email,
            role: "vendor",
            status: vendorInfo.status,
            phone: vendorInfo.phone,
            address: vendorInfo.address,
            createdAt: vendorInfo.createdAt,
            updatedAt: vendorInfo.updatedAt,
          });
          
          // Reload user in AuthContext to reflect updated status
          await reloadUser();
          
          console.log("✅ Vendor status from API:", vendorInfo.status);
          
          if (vendorInfo.status === "pending") {
            // Vendor is pending approval
            router.replace("/(auth)/vendor-pending");
          } else if (vendorInfo.status === "active" || vendorInfo.status === "approved") {
            // Vendor is approved
            router.replace("/(vendor)");
          } else if (vendorInfo.status === "rejected") {
            // Vendor is rejected - show dedicated screen
            router.replace("/(auth)/vendor-rejected");
          } else {
            // Unknown status
            if (Platform.OS === 'web') {
              if (window.confirm("Tài khoản không hợp lệ\n\nTrạng thái tài khoản không xác định. Vui lòng liên hệ với quản trị viên.")) {
                const { authService } = await import("@/services/auth.service");
                await authService.signOut();
                router.replace("/(auth)/welcome");
              }
            } else {
              Alert.alert(
                "Tài khoản không hợp lệ",
                "Trạng thái tài khoản không xác định. Vui lòng liên hệ với quản trị viên.",
                [{ text: "OK", onPress: async () => {
                  const { authService } = await import("@/services/auth.service");
                  await authService.signOut();
                  router.replace("/(auth)/welcome");
                }}]
              );
            }
          }
        } catch (error: any) {
          // Failed to get vendor info - show error
          console.error("❌ Failed to get vendor info:", error);
          const message = error.response?.data?.message || "Không thể lấy thông tin vendor. Vui lòng thử lại.";
          if (Platform.OS === 'web') {
            window.alert(`Lỗi\n\n${message}`);
          } else {
            Alert.alert("Lỗi", message);
          }
        }
      } else if (role === "admin") {
        // User is an admin
        console.log("ℹ️ Admin user, redirecting to admin panel");
        router.replace("/(admin)");
      } else {
        // User is a regular customer
        console.log("ℹ️ Regular customer, redirecting to customer tabs");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      if (Platform.OS === 'web') {
        window.alert(`Lỗi\n\n${message}`);
      } else {
        Alert.alert("Lỗi", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Chào mừng trở lại!</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </Pressable>

        <Pressable
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </Pressable>
      </View>

      {/* Sign Up Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Chưa có tài khoản? </Text>
        <Pressable onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.footerLink}>Đăng ký ngay</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  forgotPassword: {
    textAlign: "right",
    color: "#667eea",
    fontSize: 14,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
});
