import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import GradientBackground from "../../components/GradientBackground";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import * as SecureStore from "expo-secure-store";
import { getApiBase } from "../../lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  city?: string;
  country?: string;
  createdAt: string;
}

export default function ManageUsersScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"providers" | "employers">("providers");
  const [providers, setProviders] = useState<User[]>([]);
  const [employers, setEmployers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [activeTab, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/login" as never);
        return;
      }

      const base = getApiBase();
      const role = activeTab === "providers" ? "JOB_SEEKER" : "EMPLOYER";
      const params = new URLSearchParams();
      params.append("role", role);
      params.append("limit", "100");
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`${base}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        if (activeTab === "providers") {
          setProviders(users);
        } else {
          setEmployers(users);
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderUserCard = (user: User) => {
    const userName = `${user.firstName} ${user.lastName}`;
    const userLocation = [user.city, user.country].filter(Boolean).join(", ") || "No location";

    return (
      <TouchableOpacity
        key={user.id}
        style={[
          styles.userCard,
          {
            backgroundColor: isDark ? "rgba(12, 22, 42, 0.80)" : "rgba(255, 250, 240, 0.92)",
            borderColor: isDark ? "rgba(201,150,63,0.12)" : "rgba(184,130,42,0.2)",
          },
        ]}
        onPress={() => router.push(`/admin/user-detail?id=${user.id}` as never)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: isDark ? "rgba(201, 150, 63, 0.2)" : "rgba(201, 150, 63, 0.1)",
                },
              ]}
            >
              {user.avatar ? (
                <Text style={[styles.avatarText, { color: isDark ? "#A78BFA" : "#7C3AED" }]}>
                  {user.firstName[0]}{user.lastName[0]}
                </Text>
              ) : (
                <Feather
                  name="user"
                  size={24}
                  color={isDark ? "#A78BFA" : "#7C3AED"}
                />
              )}
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {userName}
              </Text>
              <Text style={[styles.userEmail, { color: isDark ? "#9A8E7A" : "#8A7B68" }]}>
                {user.email}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={isDark ? "#9A8E7A" : "#8A7B68"} />
        </View>

        <View style={styles.userInfo}>
          {user.phone && (
            <View style={styles.userInfoRow}>
              <Feather name="phone" size={14} color={isDark ? "#9A8E7A" : "#8A7B68"} />
              <Text style={[styles.userInfoText, { color: isDark ? "#B8A88A" : "#6B6355" }]}>
                {user.phone}
              </Text>
            </View>
          )}
          <View style={styles.userInfoRow}>
            <Feather name="map-pin" size={14} color={isDark ? "#9A8E7A" : "#8A7B68"} />
            <Text style={[styles.userInfoText, { color: isDark ? "#B8A88A" : "#6B6355" }]}>
              {userLocation}
            </Text>
          </View>
          <View style={styles.userInfoRow}>
            <Feather name="calendar" size={14} color={isDark ? "#9A8E7A" : "#8A7B68"} />
            <Text style={[styles.userInfoText, { color: isDark ? "#B8A88A" : "#6B6355" }]}>
              Joined {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const currentUsers = activeTab === "providers" ? providers : employers;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              {
                padding: 8,
                borderRadius: 8,
                backgroundColor: isDark ? "rgba(201,150,63,0.12)" : "rgba(184,130,42,0.06)",
              },
            ]}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Users</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: isDark ? "rgba(12, 22, 42, 0.80)" : "rgba(255, 250, 240, 0.92)",
                borderColor: isDark ? "rgba(201,150,63,0.12)" : "rgba(184,130,42,0.2)",
              },
            ]}
          >
            <Feather name="search" size={20} color={isDark ? "#9A8E7A" : "#8A7B68"} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("admin.searchByNameOrEmail")}
              placeholderTextColor={isDark ? "#8A7B68" : "#9A8E7A"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color={isDark ? "#9A8E7A" : "#8A7B68"} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View
          style={[
            styles.tabContainer,
            {
              backgroundColor: isDark ? "rgba(12, 22, 42, 0.55)" : "rgba(255, 250, 240, 0.5)",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "providers" && {
                backgroundColor: isDark ? "#A78BFA" : "#7C3AED",
              },
            ]}
            onPress={() => setActiveTab("providers")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "providers"
                      ? "#FFFAF0"
                      : isDark
                      ? "#9A8E7A"
                      : "#8A7B68",
                },
              ]}
            >
              Service Providers ({providers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "employers" && {
                backgroundColor: isDark ? "#A78BFA" : "#7C3AED",
              },
            ]}
            onPress={() => setActiveTab("employers")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "employers"
                      ? "#FFFAF0"
                      : isDark
                      ? "#9A8E7A"
                      : "#8A7B68",
                },
              ]}
            >
              Employers ({employers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : currentUsers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Feather name="users" size={48} color={isDark ? "#6B6355" : "#9A8E7A"} />
            <Text style={[styles.emptyText, { color: isDark ? "#9A8E7A" : "#8A7B68" }]}>
              No {activeTab === "providers" ? "service providers" : "employers"} found
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
            }
          >
            {currentUsers.map(renderUserCard)}
          </ScrollView>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 4,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  userCard: {
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
  },
  userInfo: {
    marginTop: 8,
    gap: 8,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userInfoText: {
    fontSize: 13,
  },
});

