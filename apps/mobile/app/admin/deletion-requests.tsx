import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getValidToken } from "../../lib/authFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import GradientBackground from "../../components/GradientBackground";
import { useTheme } from "../../context/ThemeContext";
import { getApiBase } from "../../lib/api";

interface DeletionRequest {
  id: string;
  status: string;
  reason: string | null;
  ticketNumber?: string;
  createdAt: string;
  reviewedAt: string | null;
  adminNotes: string | null;
  assignedTo: string | null;
  user: {
    id: string;
    publicId?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}

export default function DeletionRequestsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scope, setScope] = useState<"all" | "mine" | "unassigned">("all");

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();
      if (!token) {
        router.replace("/login" as never);
        return;
      }

      const base = getApiBase();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(
          `${base}/admin/users/deletion-requests?scope=${scope}&status=PENDING`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setRequests(Array.isArray(data) ? data : []);
        } else {
          setRequests([]);
        }
      } catch {
        clearTimeout(timeoutId);
        setRequests([]);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const scopeButtons: { key: "all" | "mine" | "unassigned"; label: string }[] =
    [
      { key: "all", label: "All" },
      { key: "mine", label: "My Reviews" },
      { key: "unassigned", label: "Unassigned" },
    ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Deletion Requests
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Scope Filter */}
        <View style={styles.scopeContainer}>
          {scopeButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[
                styles.scopeButton,
                {
                  backgroundColor:
                    scope === btn.key
                      ? isDark
                        ? "#C9963F"
                        : "#96782A"
                      : isDark
                        ? "rgba(12, 22, 42, 0.90)"
                        : "rgba(255,250,240,0.92)",
                  borderColor: isDark
                    ? "rgba(201,150,63,0.25)"
                    : "rgba(184,130,42,0.2)",
                },
              ]}
              onPress={() => setScope(btn.key)}
            >
              <Text
                style={[
                  styles.scopeButtonText,
                  {
                    color:
                      scope === btn.key
                        ? "#FFFAF0"
                        : isDark
                          ? "#B8A88A"
                          : "#8A7B68",
                  },
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather
                name="check-circle"
                size={48}
                color={isDark ? "#9A8E7A" : "#8A7B68"}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#9A8E7A" : "#8A7B68" },
                ]}
              >
                No pending deletion requests
              </Text>
            </View>
          ) : (
            requests.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark
                      ? "rgba(12, 22, 42, 0.90)"
                      : "rgba(255,250,240,0.92)",
                    borderColor: isDark
                      ? "rgba(201,150,63,0.25)"
                      : "rgba(184,130,42,0.2)",
                  },
                ]}
                onPress={() =>
                  router.push(
                    `/admin/deletion-request-detail?id=${req.id}` as never,
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View
                      style={[
                        styles.avatarContainer,
                        {
                          backgroundColor: isDark
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(220,38,38,0.1)",
                        },
                      ]}
                    >
                      <Feather
                        name="user-minus"
                        size={20}
                        color={isDark ? "#ef4444" : "#dc2626"}
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text
                        style={[styles.userName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {req.user.firstName} {req.user.lastName}
                      </Text>
                      <Text
                        style={[
                          styles.userEmail,
                          { color: isDark ? "#9A8E7A" : "#8A7B68" },
                        ]}
                        numberOfLines={1}
                      >
                        {req.user.email}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(245,158,11,0.2)"
                            : "rgba(217,119,6,0.1)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isDark ? "#f59e0b" : "#d97706" },
                        ]}
                      >
                        {req.status}
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={isDark ? "#9A8E7A" : "#8A7B68"}
                    />
                  </View>
                </View>

                {req.ticketNumber && (
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: isDark ? "#C9963F" : "#96782A",
                        fontFamily: "monospace",
                        marginTop: 6,
                      },
                    ]}
                  >
                    {req.ticketNumber}
                  </Text>
                )}

                {req.reason && (
                  <Text
                    style={[
                      styles.reason,
                      { color: isDark ? "#B8A88A" : "#6B5D4A" },
                    ]}
                    numberOfLines={2}
                  >
                    &ldquo;{req.reason}&rdquo;
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text
                    style={[
                      styles.dateText,
                      { color: isDark ? "#9A8E7A" : "#8A7B68" },
                    ]}
                  >
                    {formatDate(req.createdAt)}
                  </Text>
                  <Text
                    style={[
                      styles.roleText,
                      { color: isDark ? "#9A8E7A" : "#8A7B68" },
                    ]}
                  >
                    {req.user.role.replace("_", " ")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  scopeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  scopeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  scopeButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  reason: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 10,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,250,240,0.08)",
  },
  dateText: {
    fontSize: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
