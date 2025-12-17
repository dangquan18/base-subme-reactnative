import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function VendorLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!loading && user) {
        console.log("🔍 Checking vendor status in layout:", user.status, "role:", user.role);
        
        // Check if user is vendor and approved
        if (user.role !== "vendor") {
          // Not a vendor, redirect to customer tabs
          console.log("⚠️ Not a vendor, redirecting to tabs");
          router.replace("/(tabs)");
        } else if (user.status === "pending" || (!user.status && user.role === "vendor")) {
          // Vendor is pending approval
          console.log("⏳ Vendor pending, redirecting to pending screen");
          router.replace("/(auth)/vendor-pending");
        } else if (user.status === "rejected") {
          // Vendor is rejected
          console.log("❌ Vendor rejected, redirecting to welcome");
          router.replace("/(auth)/welcome");
        } else {
          console.log("✅ Vendor approved, allowing access");
        }
      }
      setChecking(false);
    };

    checkVendorStatus();
  }, [user, loading]);

  if (loading || checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // Only render tabs if user is approved vendor
  if (!user || user.role !== "vendor" || (user.status !== "active" && user.status !== "approved")) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#eee",
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: "Gói dịch vụ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cửa hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
