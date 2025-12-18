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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"vendor" | "user">("user");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert("Lỗi\n\nVui lòng nhập đầy đủ thông tin bắt buộc");
      } else {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
      }
      return;
    }

    if (password !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert("Lỗi\n\nMật khẩu không khớp");
      } else {
        Alert.alert("Lỗi", "Mật khẩu không khớp");
      }
      return;
    }

    if (password.length < 6) {
      if (Platform.OS === 'web') {
        window.alert("Lỗi\n\nMật khẩu phải có ít nhất 6 ký tự");
      } else {
        Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      }
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Starting signup with role:", role);
      await signUp(email, password, name, role, phone || undefined, address || undefined);
      console.log("✅ Signup successful!");
      
      const message = role === "vendor" 
        ? "Đăng ký tài khoản vendor thành công! Tài khoản của bạn đang chờ xét duyệt trong 1-3 ngày. Vui lòng đăng nhập để kiểm tra trạng thái."
        : "Đăng ký tài khoản thành công! Vui lòng đăng nhập.";
      
      console.log("📢 Showing success alert");
      
      // Use native alert for web, Alert for mobile
      if (Platform.OS === 'web') {
        window.alert(`Thành công\n\n${message}`);
        console.log("🔄 Navigating to signin");
        router.replace("/(auth)/signin");
      } else {
        Alert.alert("Thành công", message, [
          { text: "OK", onPress: () => {
            console.log("🔄 Navigating to signin");
            router.replace("/(auth)/signin");
          }}
        ]);
      }
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      const message = error.response?.data?.message || error.message || "Đăng ký thất bại. Vui lòng thử lại.";
      
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
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Bắt đầu tiết kiệm ngay hôm nay</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Đăng ký với vai trò:</Text>
          <View style={styles.roleButtons}>
            <Pressable
              style={[styles.roleButton, role === "user" && styles.roleButtonActive]}
              onPress={() => setRole("user")}
            >
              <Ionicons
                name="person"
                size={24}
                color={role === "user" ? "#FFF" : "#667eea"}
              />
              <Text style={[styles.roleButtonText, role === "user" && styles.roleButtonTextActive]}>
                Người dùng
              </Text>
            </Pressable>
            <Pressable
              style={[styles.roleButton, role === "vendor" && styles.roleButtonActive]}
              onPress={() => setRole("vendor")}
            >
              <Ionicons
                name="storefront"
                size={24}
                color={role === "vendor" ? "#FFF" : "#667eea"}
              />
              <Text style={[styles.roleButtonText, role === "vendor" && styles.roleButtonTextActive]}>
                Nhà cung cấp
              </Text>
            </Pressable>
          </View>
          {role === "vendor" && (
            <Text style={styles.roleNote}>
              ⓘ Tài khoản vendor sẽ được xét duyệt trong 1-3 ngày
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />
        </View>

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

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại (tùy chọn)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Địa chỉ (tùy chọn)"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <Pressable
          style={[styles.signUpButton, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Text>
        </Pressable>
      </View>

      {/* Sign In Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Đã có tài khoản? </Text>
        <Pressable onPress={() => router.push("/(auth)/signin")}>
          <Text style={styles.footerLink}>Đăng nhập</Text>
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
    marginBottom: 32,
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
  signUpButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
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
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#667eea",
    backgroundColor: "#FFF",
  },
  roleButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  roleButtonTextActive: {
    color: "#FFF",
  },
  roleNote: {
    fontSize: 13,
    color: "#FF9800",
    marginTop: 8,
    fontStyle: "italic",
  },
});
