import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { AppTheme } from "@/constants/theme";

interface MenuItem {
  icon: string;
  label: string;
  badge?: string;
  value?: string | boolean;
  toggle?: boolean;
  onToggle?: React.Dispatch<React.SetStateAction<boolean>>;
  onPress?: () => void;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = React.useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const menuItems: MenuSection[] = [
    {
      section: "Tài khoản",
      items: [
        {
          icon: "person-outline",
          label: "Thông tin cá nhân",
          onPress: () => {},
        },
        {
          icon: "wallet-outline",
          label: "Ví điện tử",
          badge: "0 đ",
          onPress: () => {},
        },
        {
          icon: "card-outline",
          label: "Phương thức thanh toán",
          onPress: () => {},
        },
      ],
    },
    {
      section: "Cài đặt",
      items: [
        {
          icon: "notifications-outline",
          label: "Thông báo",
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: "refresh-outline",
          label: "Auto Pay",
          toggle: true,
          value: autoPayEnabled,
          onToggle: setAutoPayEnabled,
        },
        {
          icon: "language-outline",
          label: "Ngôn ngữ",
          value: "Tiếng Việt",
          onPress: () => {},
        },
      ],
    },
    {
      section: "Khác",
      items: [
        {
          icon: "help-circle-outline",
          label: "Trung tâm trợ giúp",
          onPress: () => {},
        },
        {
          icon: "document-text-outline",
          label: "Điều khoản dịch vụ",
          onPress: () => {},
        },
        {
          icon: "shield-checkmark-outline",
          label: "Chính sách bảo mật",
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[AppTheme.colors.primary, AppTheme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  "https://ui-avatars.com/api/?name=" + user?.name,
              }}
              style={styles.avatar}
            />
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "guest@example.com"}
          </Text>

          {!user?.isPremium && (
            <Pressable style={styles.premiumButton}>
              <Ionicons name="star" size={16} color={AppTheme.colors.warning} />
              <Text style={styles.premiumButtonText}>Nâng cấp Premium</Text>
            </Pressable>
          )}
        </View>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Gói đăng ký</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,200đ</Text>
            <Text style={styles.statLabel}>Điểm thưởng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={item.onPress}
                    disabled={item.toggle}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconWrapper}>
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color={AppTheme.colors.primary}
                        />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.badge && (
                        <Text style={styles.menuItemBadge}>{item.badge}</Text>
                      )}
                      {item.value &&
                        !item.toggle &&
                        typeof item.value === "string" && (
                          <Text style={styles.menuItemValue}>{item.value}</Text>
                        )}
                      {item.toggle ? (
                        <Switch
                          value={
                            typeof item.value === "boolean" ? item.value : false
                          }
                          onValueChange={item.onToggle}
                          trackColor={{
                            false: AppTheme.colors.border,
                            true: AppTheme.colors.primary,
                          }}
                          thumbColor={AppTheme.colors.backgroundWhite}
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#CCC"
                        />
                      )}
                    </View>
                  </Pressable>
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.menuDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.signOutButtonText}>Đăng xuất</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
    paddingHorizontal: AppTheme.spacing.xl,
    paddingBottom: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: AppTheme.fontSize.xxxl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textWhite,
  },
  scrollContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: AppTheme.colors.backgroundWhite,
    padding: AppTheme.spacing.xl,
    alignItems: "center",
    borderRadius: AppTheme.borderRadius.lg,
    marginTop: 20,
    marginHorizontal: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.lg,
    ...AppTheme.shadow.md,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: AppTheme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: AppTheme.colors.backgroundWhite,
    ...AppTheme.shadow.sm,
  },
  userName: {
    fontSize: AppTheme.fontSize.xl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
    marginBottom: 16,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.warningLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.warning,
  },
  premiumButtonText: {
    fontSize: AppTheme.fontSize.sm,
    fontWeight: AppTheme.fontWeight.semibold,
    color: AppTheme.colors.warning,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.backgroundWhite,
    marginHorizontal: AppTheme.spacing.xl,
    marginTop: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    ...AppTheme.shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: AppTheme.fontSize.xl,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: AppTheme.fontSize.xs,
    color: AppTheme.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: AppTheme.colors.divider,
  },
  section: {
    marginBottom: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: AppTheme.fontSize.md,
    fontWeight: AppTheme.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.md,
  },
  menuCard: {
    backgroundColor: AppTheme.colors.backgroundWhite,
    borderRadius: AppTheme.borderRadius.md,
    overflow: "hidden",
    ...AppTheme.shadow.sm,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: AppTheme.spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppTheme.colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: AppTheme.fontSize.base,
    color: AppTheme.colors.textPrimary,
    fontWeight: AppTheme.fontWeight.medium,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemBadge: {
    fontSize: AppTheme.fontSize.sm,
    fontWeight: AppTheme.fontWeight.semibold,
    color: AppTheme.colors.primary,
  },
  menuItemValue: {
    fontSize: AppTheme.fontSize.sm,
    color: AppTheme.colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: AppTheme.colors.divider,
    marginLeft: 50,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppTheme.colors.backgroundWhite,
    marginHorizontal: AppTheme.spacing.xl,
    marginTop: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.xxl,
    paddingVertical: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.error,
    ...AppTheme.shadow.sm,
  },
  signOutButtonText: {
    fontSize: AppTheme.fontSize.md,
    fontWeight: AppTheme.fontWeight.semibold,
    color: AppTheme.colors.error,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 32,
  },
  footerText: {
    fontSize: AppTheme.fontSize.xs,
    color: AppTheme.colors.textLight,
  },
});
