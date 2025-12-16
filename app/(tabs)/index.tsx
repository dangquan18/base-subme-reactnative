import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { packageService } from "@/services/package.service";
import { Package, Category } from "@/types";
import { AppTheme } from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, featuredData] = await Promise.all([
        packageService.getCategories(),
        packageService.getFeaturedPackages(5),
      ]);
      setCategories(categoriesData);
      setFeaturedPackages(featuredData);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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

  // Mapping icon cho categories
  const getCategoryIcon = (categoryName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'Giải trí': 'game-controller',
      'Giáo dục': 'school',
      'Sức khỏe': 'fitness',
      'Ẩm thực': 'restaurant',
      'Du lịch': 'airplane',
      'Công nghệ': 'hardware-chip',
      'Thời trang': 'shirt',
      'Âm nhạc': 'musical-notes',
      'Thể thao': 'football',
      'default': 'apps'
    };
    return iconMap[categoryName] || iconMap['default'];
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.headerTitle}>Khám phá dịch vụ</Text>
              <Text style={styles.headerSubtitle}>Đăng ký ngay hôm nay</Text>
            </View>
            <Pressable style={styles.notificationButton}>
              <View style={styles.notificationIconWrapper}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
                <View style={styles.notificationBadge} />
              </View>
            </Pressable>
          </View>

          {/* Search Bar */}
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push("/(tabs)/explore" as any)}
          >
            <Ionicons
              name="search"
              size={20}
              color={AppTheme.colors.textSecondary}
            />
            <Text style={styles.searchPlaceholder}>
              Tìm kiếm gói dịch vụ...
            </Text>
            <Ionicons
              name="options-outline"
              size={20}
              color={AppTheme.colors.textSecondary}
            />
          </Pressable>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconWrapper, { backgroundColor: "#E8F5E9" }]}
            >
              <Ionicons name="cube" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{featuredPackages.length}+</Text>
            <Text style={styles.statLabel}>Gói dịch vụ</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconWrapper, { backgroundColor: "#E3F2FD" }]}
            >
              <Ionicons name="grid" size={28} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{categories.length}+</Text>
            <Text style={styles.statLabel}>Danh mục</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconWrapper, { backgroundColor: "#FFF9C4" }]}
            >
              <Ionicons name="star" size={28} color="#FFC107" />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Khám phá nhanh</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/explore" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#EDE7F6" }]}
              >
                <Ionicons name="search" size={24} color="#673AB7" />
              </View>
              <Text style={styles.quickActionText}>Tìm kiếm</Text>
            </Pressable>
            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/explore" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <Ionicons name="grid" size={24} color="#2196F3" />
              </View>
              <Text style={styles.quickActionText}>Danh mục</Text>
            </Pressable>
            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/subscriptions" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Ionicons name="bookmark" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionText}>Gói của tôi</Text>
            </Pressable>
            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/profile" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FFF9C4" }]}
              >
                <Ionicons name="gift" size={24} color="#FFC107" />
              </View>
              <Text style={styles.quickActionText}>Ưu đãi</Text>
            </Pressable>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục phổ biến</Text>
            <Pressable onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={styles.seeAllButton}>Xem tất cả →</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push("/(tabs)/explore" as any)}
              >
                <LinearGradient
                  colors={["#667eea20", "#667eea10"]}
                  style={styles.categoryIcon}
                >
                  <Ionicons 
                    name={getCategoryIcon(category.name)} 
                    size={32} 
                    color={AppTheme.colors.primary} 
                  />
                </LinearGradient>
                <Text style={styles.categoryName}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Packages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Gói nổi bật ⭐</Text>
              <Text style={styles.sectionSubtitle}>Được yêu thích nhất</Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={styles.seeAllButton}>Xem tất cả →</Text>
            </Pressable>
          </View>

          {featuredPackages.map((pkg) => (
            <Pressable
              key={pkg.id}
              style={styles.packageCard}
              onPress={() => router.push(`/package/${pkg.id}` as any)}
            >
              {(pkg.imageUrl || pkg.image) ? (
                <Image
                  source={{ uri: pkg.imageUrl || pkg.image }}
                  style={styles.featuredImage}
                  defaultSource={require("@/assets/images/partial-react-logo.png")}
                />
              ) : (
                <View style={[styles.featuredImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={48} color="#ccc" />
                </View>
              )}
              <View style={styles.packageBadge}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.packageBadgeText}>{Number(pkg.average_rating || 0).toFixed(1)}</Text>
              </View>
              <View style={styles.packageContent}>
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName} numberOfLines={1}>
                    {pkg.name}
                  </Text>
                </View>

                <Text style={styles.packageProvider}>{pkg.vendor.name}</Text>
                <Text style={styles.packageDescription} numberOfLines={2}>
                  {pkg.description}
                </Text>

                <View style={styles.packageFooter}>
                  <View style={styles.priceWrapper}>
                    <Text style={styles.packagePrice}>
                      {formatPrice(pkg.price)}
                    </Text>
                    <Text style={styles.packageFrequency}>
                      {getDurationText(pkg.duration_value, pkg.duration_unit)}
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
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </LinearGradient>
                  </Pressable>
                </View>
                <View style={styles.subscriberRow}>
                  <Ionicons
                    name="people"
                    size={14}
                    color={AppTheme.colors.textLight}
                  />
                  <Text style={styles.subscriberCount}>
                    {pkg.subscriber_count}+ người đăng ký
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  heroHeader: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: AppTheme.spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: {
    fontSize: AppTheme.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
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
  },
  notificationButton: {
    padding: 4,
  },
  notificationIconWrapper: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppTheme.colors.error,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.textWhite,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.backgroundWhite,
    borderRadius: AppTheme.borderRadius.md,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.md,
    ...AppTheme.shadow.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: AppTheme.fontSize.base,
    color: AppTheme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: AppTheme.spacing.xl,
    marginTop: 20,
    gap: 12,
    marginBottom: AppTheme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppTheme.colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    ...AppTheme.shadow.sm,
  },
  statIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
  quickActionsSection: {
    paddingHorizontal: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.xl,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...AppTheme.shadow.sm,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1E293B",
    textAlign: "center",
  },
  section: {
    marginBottom: AppTheme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: AppTheme.fontSize.xl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  seeAllButton: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.primary,
    fontWeight: AppTheme.fontWeight.semibold,
  },
  categoriesContainer: {
    paddingHorizontal: AppTheme.spacing.xl,
    gap: AppTheme.spacing.md,
  },
  categoryCard: {
    alignItems: "center",
    width: 80,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: AppTheme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: AppTheme.spacing.sm,
    ...AppTheme.shadow.sm,
  },
  categoryEmoji: {
    fontSize: 36,
  },
  categoryName: {
    fontSize: AppTheme.fontSize.xs,
    color: AppTheme.colors.textPrimary,
    fontWeight: AppTheme.fontWeight.medium,
    textAlign: "center",
  },
  packageCard: {
    backgroundColor: AppTheme.colors.backgroundWhite,
    borderRadius: AppTheme.borderRadius.lg,
    marginHorizontal: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.lg,
    overflow: "hidden",
    ...AppTheme.shadow.md,
  },
  featuredImage: {
    width: "100%",
    height: 200,
    backgroundColor: AppTheme.colors.backgroundLight,
  },
  packageImage: {
    width: "100%",
    height: 200,
    backgroundColor: AppTheme.colors.backgroundLight,
  },
  packageBadge: {
    position: "absolute",
    top: AppTheme.spacing.md,
    right: AppTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 193, 7, 0.95)",
    paddingHorizontal: AppTheme.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.full,
  },
  packageBadgeText: {
    fontSize: AppTheme.fontSize.xs,
    fontWeight: AppTheme.fontWeight.semibold,
    color: "#1E293B",
  },
  packageContent: {
    padding: AppTheme.spacing.lg,
  },
  packageHeader: {
    marginBottom: 6,
  },
  packageName: {
    fontSize: AppTheme.fontSize.lg,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
  },
  packageProvider: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.sm,
    fontWeight: AppTheme.fontWeight.medium,
  },
  packageDescription: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.md,
    lineHeight: 20,
  },
  packageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.spacing.sm,
  },
  priceWrapper: {
    flex: 1,
  },
  packagePrice: {
    fontSize: AppTheme.fontSize.xl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
  },
  packageFrequency: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  subscribeButton: {
    borderRadius: AppTheme.borderRadius.sm,
    overflow: "hidden",
    ...AppTheme.shadow.sm,
  },
  subscribeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.sm + 2,
  },
  subscribeButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fontSize.sm,
    fontWeight: AppTheme.fontWeight.semibold,
  },
  subscriberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: AppTheme.spacing.sm,
  },
  subscriberCount: {
    fontSize: AppTheme.fontSize.xs,
    color: AppTheme.colors.textLight,
  },
});
