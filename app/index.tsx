import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(auth)/welcome");
      } else if (user.role === "vendor") {
        router.replace("/(vendor)");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [loading, user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={{ marginTop: 16, color: "#666" }}>Đang tải...</Text>
    </View>
  );
}
