import { AppTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const { width } = Dimensions.get("window");

interface VendorPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: "pending" | "approved" | "rejected";
  subscribers: number;
  category: string;
  imageUrl?: string;
  features: string[];
}

export default function VendorPackages() {
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<VendorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<VendorPackage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    features: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [packages, statusFilter, searchQuery]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // TODO: Ghép API thật
      // const data = await vendorService.getPackages();
      
      // Mock data
      const mockPackages: VendorPackage[] = [
        {
          id: 1,
          name: "Gói Cà Phê Premium",
          description: "10 cốc cà phê cao cấp mỗi tháng",
          price: 599000,
          duration: 30,
          status: "approved",
          subscribers: 85,
          category: "Đồ uống",
          features: ["Cà phê chất lượng cao", "Giao hàng miễn phí", "Ưu đãi đặc biệt"],
        },
        {
          id: 2,
          name: "Gói Cơm Trưa",
          description: "20 suất cơm trưa mỗi tháng",
          price: 250000,
          duration: 30,
          status: "approved",
          subscribers: 62,
          category: "Ăn uống",
          features: ["Cơm nóng mỗi ngày", "Menu đa dạng", "Giao tận nơi"],
        },
        {
          id: 3,
          name: "Gói Đồ Uống",
          description: "15 ly trà sữa mỗi tháng",
          price: 450000,
          duration: 30,
          status: "pending",
          subscribers: 48,
          category: "Đồ uống",
          features: ["Nhiều hương vị", "Size vừa/lớn", "Topping miễn phí"],
        },
        {
          id: 4,
          name: "Gói Gym Premium",
          description: "Tập gym không giới hạn",
          price: 899000,
          duration: 30,
          status: "rejected",
          subscribers: 12,
          category: "Thể thao",
          features: ["Tập không giới hạn", "HLV cá nhân", "Phòng tắm miễn phí"],
        },
      ];

      setPackages(mockPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPackages = () => {
    let filtered = packages;

    if (statusFilter !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPackages(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages();
  };

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      features: "",
    });
    setModalVisible(true);
  };

  const handleEditPackage = (pkg: VendorPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      duration: pkg.duration.toString(),
      category: pkg.category,
      features: pkg.features.join(", "),
    });
    setModalVisible(true);
  };

  const handleDeletePackage = (id: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa gói dịch vụ này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Ghép API thật
              // await vendorService.deletePackage(id);
              
              setPackages(packages.filter((pkg) => pkg.id !== id));
              Alert.alert("Thành công", "Đã xóa gói dịch vụ");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa gói dịch vụ");
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      };

      if (selectedPackage) {
        // TODO: Ghép API thật
        // await vendorService.updatePackage(selectedPackage.id, packageData);
        
        setPackages(
          packages.map((pkg) =>
            pkg.id === selectedPackage.id
              ? { ...pkg, ...packageData }
              : pkg
          )
        );
        Alert.alert("Thành công", "Đã cập nhật gói dịch vụ");
      } else {
        // TODO: Ghép API thật
        // const newPackage = await vendorService.createPackage(packageData);
        
        const newPackage: VendorPackage = {
          id: Date.now(),
          ...packageData,
          status: "pending",
          subscribers: 0,
        };
        setPackages([newPackage, ...packages]);
        Alert.alert("Thành công", "Đã tạo gói dịch vụ mới");
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu gói dịch vụ");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return AppTheme.colors.success;
      case "pending":
        return AppTheme.colors.warning;
      case "rejected":
        return AppTheme.colors.error;
      default:
        return AppTheme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Gói dịch vụ</Text>
        <Text style={styles.headerSubtitle}>
          {packages.length} gói · {filteredPackages.length} hiển thị
        </Text>
      </LinearGradient>

      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={AppTheme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm gói dịch vụ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.addButton} onPress={handleCreatePackage}>
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[
          { key: "all", label: "Tất cả" },
          { key: "approved", label: "Đã duyệt" },
          { key: "pending", label: "Chờ duyệt" },
          { key: "rejected", label: "Từ chối" },
        ].map((filter) => (
          <Pressable
            key={filter.key}
            style={[
              styles.filterChip,
              statusFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Package List */}
      <ScrollView
        style={styles.packageList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <View style={styles.packageTitle}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(pkg.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(pkg.status) },
                      ]}
                    >
                      {getStatusText(pkg.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.packageActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleEditPackage(pkg)}
                  >
                    <Ionicons name="create-outline" size={20} color={AppTheme.colors.primary} />
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDeletePackage(pkg.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={AppTheme.colors.error} />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.packageDescription} numberOfLines={2}>
                {pkg.description}
              </Text>

              <View style={styles.packageStats}>
                <View style={styles.packageStat}>
                  <Ionicons name="pricetag" size={16} color={AppTheme.colors.primary} />
                  <Text style={styles.packageStatText}>
                    {formatCurrency(pkg.price)}
                  </Text>
                </View>
                <View style={styles.packageStat}>
                  <Ionicons name="time" size={16} color={AppTheme.colors.textLight} />
                  <Text style={styles.packageStatText}>{pkg.duration} ngày</Text>
                </View>
                <View style={styles.packageStat}>
                  <Ionicons name="people" size={16} color={AppTheme.colors.success} />
                  <Text style={styles.packageStatText}>
                    {pkg.subscribers} người đăng ký
                  </Text>
                </View>
              </View>

              {pkg.features && pkg.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {pkg.features.slice(0, 2).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={AppTheme.colors.success}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                  {pkg.features.length > 2 && (
                    <Text style={styles.moreFeatures}>
                      +{pkg.features.length - 2} tính năng khác
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có gói dịch vụ nào</Text>
            <Pressable style={styles.emptyButton} onPress={handleCreatePackage}>
              <Text style={styles.emptyButtonText}>Tạo gói mới</Text>
            </Pressable>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Create/Edit Modal */}
      {/* <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPackage ? "Sửa gói dịch vụ" : "Tạo gói mới"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppTheme.colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên gói *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Gói Cà Phê Premium"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Mô tả chi tiết gói dịch vụ..."
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Giá (VNĐ) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="299000"
                    value={formData.price}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Thời hạn (ngày) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="30"
                    value={formData.duration}
                    onChangeText={(text) =>
                      setFormData({ ...formData, duration: text })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Danh mục</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Đồ uống, Ăn uống..."
                  value={formData.category}
                  onChangeText={(text) =>
                    setFormData({ ...formData, category: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tính năng (cách nhau bởi dấu phẩy)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="VD: Giao miễn phí, Chất lượng cao, Ưu đãi đặc biệt"
                  value={formData.features}
                  onChangeText={(text) =>
                    setFormData({ ...formData, features: text })
                  }
                  multiline
                  numberOfLines={2}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {selectedPackage ? "Cập nhật" : "Tạo mới"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    ...AppTheme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: AppTheme.colors.textPrimary,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...AppTheme.shadow.md,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.divider,
  },
  filterChipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  packageList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  packageCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...AppTheme.shadow.md,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  packageTitle: {
    flex: 1,
    gap: 8,
  },
  packageName: {
    fontSize: 17,
    fontWeight: "700",
    color: AppTheme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  packageActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: AppTheme.colors.backgroundSecondary,
  },
  packageDescription: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  packageStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  packageStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  packageStatText: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
    paddingTop: 12,
    gap: 6,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
  },
  moreFeatures: {
    fontSize: 12,
    color: AppTheme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: AppTheme.colors.textLight,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppTheme.colors.textPrimary,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: AppTheme.colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    color: AppTheme.colors.textPrimary,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: AppTheme.colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: AppTheme.colors.textSecondary,
  },
  submitButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
});
