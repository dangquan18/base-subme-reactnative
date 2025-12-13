import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CATEGORIES } from "@/constants/categories";
import { MOCK_PACKAGES, searchPackages } from "@/constants/mock-packages";
import { PackageCategory } from "@/types";
import { AppTheme } from "@/constants/theme";

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    PackageCategory | "all"
  >("all");

  // Filter packages based on search and category
  const filteredPackages = useMemo(() => {
    let packages = MOCK_PACKAGES;

    // Filter by search query
    if (searchQuery.trim()) {
      packages = searchPackages(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      packages = packages.filter((pkg) => pkg.category === selectedCategory);
    }

    return packages;
  }, [searchQuery, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "/ngày";
      case "weekly":
        return "/tuần";
      case "monthly":
        return "/tháng";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Khám phá gói</Text>
        <Text style={styles.headerSubtitle}>Tìm kiếm gói phù hợp với bạn</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={AppTheme.colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm gói dịch vụ..."
            placeholderTextColor={AppTheme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={AppTheme.colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <Pressable
              style={[
                styles.filterChip,
                selectedCategory === "all" && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === "all" && styles.filterChipTextActive,
                ]}
              >
                Tất cả ({MOCK_PACKAGES.length})
              </Text>
            </Pressable>
            {CATEGORIES.map((category) => {
              const count = MOCK_PACKAGES.filter(
                (pkg) => pkg.category === category.id
              ).length;
              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === category.id && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(category.id as PackageCategory)
                  }
                >
                  <Text style={styles.filterEmoji}>{category.emoji}</Text>
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === category.id &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {category.name} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsCount}>
            {filteredPackages.length} gói dịch vụ
          </Text>

          {filteredPackages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                Không tìm thấy gói dịch vụ phù hợp
              </Text>
              <Text style={styles.emptySubtext}>
                Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
              </Text>
            </View>
          ) : (
            filteredPackages.map((pkg) => (
              <Pressable
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => router.push(`/package/${pkg.id}` as any)}
              >
                <Image
                  source={{ uri: pkg.image }}
                  style={styles.packageImage}
                  defaultSource={require("@/assets/images/partial-react-logo.png")}
                />
                <View style={styles.packageContent}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFC107" />
                      <Text style={styles.ratingText}>{pkg.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.packageProvider}>{pkg.providerName}</Text>
                  <Text style={styles.packageDescription} numberOfLines={2}>
                    {pkg.description}
                  </Text>

                  <View style={styles.packageFooter}>
                    <View>
                      <Text style={styles.packagePrice}>
                        {formatPrice(pkg.price)}
                        <Text style={styles.packageFrequency}>
                          {getFrequencyText(pkg.frequency)}
                        </Text>
                      </Text>
                      <Text style={styles.subscriberCount}>
                        {pkg.subscriberCount}+ người đăng ký
                      </Text>
                    </View>
                    <Pressable style={styles.subscribeButton}>
                      <LinearGradient
                        colors={[
                          AppTheme.colors.primary,
                          AppTheme.colors.primaryLight,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.subscribeGradient}
                      >
                        <Text style={styles.subscribeButtonText}>Đăng ký</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: AppTheme.fontSize.xxxl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: AppTheme.fontSize.base,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: AppTheme.spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.backgroundWhite,
    borderRadius: AppTheme.borderRadius.md,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: 2,
    gap: AppTheme.spacing.sm,
    ...AppTheme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: AppTheme.spacing.md,
    fontSize: AppTheme.fontSize.base,
    color: AppTheme.colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.backgroundLight,
    gap: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primaryDark,
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  resultsSection: {
    padding: 20,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  packageCard: {
    backgroundColor: AppTheme.colors.backgroundWhite,
    borderRadius: AppTheme.borderRadius.lg,
    marginBottom: AppTheme.spacing.lg,
    overflow: "hidden",
    ...AppTheme.shadow.md,
  },
  packageImage: {
    width: "100%",
    height: 200,
    backgroundColor: AppTheme.colors.backgroundLight,
  },
  packageContent: {
    padding: 16,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  packageName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  packageProvider: {
    fontSize: 14,
    color: "#667eea",
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  packageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  packageFrequency: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#666",
  },
  subscriberCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  subscribeButton: {
    borderRadius: AppTheme.borderRadius.sm,
    overflow: "hidden",
    ...AppTheme.shadow.sm,
  },
  subscribeGradient: {
    paddingHorizontal: AppTheme.spacing.xl,
    paddingVertical: AppTheme.spacing.sm + 2,
  },
  subscribeButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fontSize.sm,
    fontWeight: AppTheme.fontWeight.semibold,
    textAlign: "center",
  },
  providerName: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.sm,
    fontWeight: AppTheme.fontWeight.medium,
  },
});
