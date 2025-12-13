import { View, Text, StyleSheet } from "react-native";

export default function VendorPackages() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý gói dịch vụ</Text>
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
