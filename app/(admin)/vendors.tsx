import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Nếu Android Emulator → dùng 10.0.2.2
const API_URL = "http://localhost:3000/vendor/admin/all";

export default function VendorsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH API =================
  const fetchVendors = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token, vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setVendors(data?.vendors || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách vendor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Reload data khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchVendors();
    }, [])
  );

  // ================= UI HELPER =================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
        return "#2e7d32";
      case "pending":
        return "#ed6c02";
      default:
        return "#757575";
    }
  };

  // ================= RENDER ITEM =================
  const renderItem = ({ item }: { item: any }) => {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/vendor/[id]",
            params: { id: item.id },
          })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.85 },
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { borderColor: getStatusColor(item.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status?.toUpperCase() || "UNKNOWN"}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📧 {item.email}</Text>
          <Text style={styles.infoText}>
            📞 {item.phone || "Không có sđt"}
          </Text>
          <Text style={styles.infoText} numberOfLines={1}>
            🏠 {item.address || "Chưa cập nhật địa chỉ"}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.planCountText}>
            📦 Số gói đã đăng:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {item.plans?.length || 0}
            </Text>
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </Pressable>
    );
  };

  // ================= SIGN OUT =================
  const handleSignOut = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
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

  // ================= RENDER =================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Quản lý Vendor</Text>

          <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Không tìm thấy vendor nào
            </Text>
          }
        />
      )}
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  planCountText: {
    fontSize: 14,
    color: "#007bff",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 16,
  },
});
