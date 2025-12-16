import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { packageService } from "@/services/package.service";
import { Package, Category } from "@/types";
import { AppTheme } from "@/constants/theme";

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [searchQuery, selectedCategory, packages]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, packagesData] = await Promise.all([
        packageService.getCategories(),
        packageService.getPackages({ limit: 50 }),
      ]);
      setCategories(categoriesData || []);
      setPackages(packagesData?.packages || []);
      setFilteredPackages(packagesData?.packages || []);
    } catch (error: any) {
      console.error("Error loading explore data:", error);
      setError(error.message || "Không thể tải dữ liệu");
      setCategories([]);
      setPackages([]);
      setFilteredPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPackages = async () => {
    try {
      // Search by keyword
      if (searchQuery.trim()) {
        setSearching(true);
        const result = await packageService.searchPackages({ 
          keyword: searchQuery,
          limit: 50 
        });
        let filtered = result.packages;

        // Filter by category if selected
        if (selectedCategory !== "all") {
          filtered = filtered.filter((pkg) => pkg.category.id === selectedCategory);
        }
        
        setFilteredPackages(filtered);
        setSearching(false);
      } else {
        // Filter by category only
        if (selectedCategory !== "all") {
          const filtered = packages.filter((pkg) => pkg.category.id === selectedCategory);
          setFilteredPackages(filtered);
        } else {
          setFilteredPackages(packages);
        }
      }
    } catch (error) {
      console.error("Error filtering packages:", error);
      setSearching(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getDurationText = (value: number, unit: string) => {
    return `/${value} ${unit}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        <Text style={{ marginTop: 16, color: AppTheme.colors.textSecondary }}>Đang tải...</Text>
      </View>
    );
  }

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
                Tất cả ({packages?.length || 0})
              </Text>
            </Pressable>
            {categories?.map((category) => {
              const count = packages?.filter(
                (pkg) => pkg.category.id === category.id
              ).length;
              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === category.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.filterEmoji}>{category.icon}</Text>
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
            {filteredPackages?.length || 0} gói dịch vụ
          </Text>

          {searching && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color={AppTheme.colors.primary} />
            </View>
          )}

          {!searching && filteredPackages?.length === 0 ? (
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
            filteredPackages?.map((pkg) => (
              <Pressable
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => router.push(`/package/${pkg.id}` as any)}
              >
                {(pkg.imageUrl || pkg.image) ? (
                  <Image
                    source={{ uri: pkg.imageUrl || pkg.image }}
                    style={styles.packageImage}
                    defaultSource={require("@/assets/images/partial-react-logo.png")}
                  />
                ) : (
                  <View style={[styles.packageImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={48} color="#ccc" />
                  </View>
                )}
                <View style={styles.packageContent}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFC107" />
                      <Text style={styles.ratingText}>{Number(pkg.average_rating || 0).toFixed(1)}</Text>
                    </View>
                  </View>

                  <Text style={styles.packageProvider}>{pkg.vendor.name}</Text>
                  <Text style={styles.packageDescription} numberOfLines={2}>
                    {pkg.description}
                  </Text>

                  <View style={styles.packageFooter}>
                    <View>
                      <Text style={styles.packagePrice}>
                        {formatPrice(pkg.price)}
                      </Text>
                      <Text style={styles.packageFrequency}>
                        {getDurationText(pkg.duration_value, pkg.duration_unit)}
                      </Text>
                      <Text style={styles.subscriberCount}>
                        {pkg.subscriber_count}+ người đăng ký
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
