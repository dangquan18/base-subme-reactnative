import { View, Text, StyleSheet } from "react-native";

export default function VendorOrders() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý đơn hàng</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
