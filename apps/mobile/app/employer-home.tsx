import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import { useState, useCallback } from "react";
import GradientBackground from "../components/GradientBackground";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getApiBase } from "../lib/api";
import { TouchableButton } from "../components/TouchableButton";
import EmailVerificationBanner from "../components/EmailVerificationBanner";

export default function EmployerHome() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );
      return () => sub.remove();
    }, []),
  );

  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    hasAddress: boolean;
  } | null>(null);

  const [activeBooking, setActiveBooking] = useState<{
    id: string;
    job?: { title: string };
    jobSeeker?: { firstName: string; lastName: string };
  } | null>(null);

  const fetchProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) return;
      const base = getApiBase();
      const res = await fetch(`${base}/profiles/employer/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        const profileData = data.profile;
        const isVerified = !!(u.emailVerifiedAt && u.phoneVerifiedAt);

        // Check address verification (must have addressLine1 or city and country)
        // Check both EmployerProfile and UserProfile (fallback)
        // Handle both null/undefined and empty strings
        const hasAddressLine1 =
          profileData?.addressLine1 &&
          profileData.addressLine1.trim().length > 0;
        const hasCity = profileData?.city && profileData.city.trim().length > 0;
        const hasCountry =
          profileData?.country && profileData.country.trim().length > 0;
        let addressVerified = hasAddressLine1 || (hasCity && hasCountry);

        // If employer profile doesn't have address, check user profile as fallback
        if (!addressVerified && data.userProfile) {
          const userProfile = data.userProfile;
          const userHasAddressLine1 =
            userProfile?.addressLine1 &&
            userProfile.addressLine1.trim().length > 0;
          const userHasCity =
            userProfile?.city && userProfile.city.trim().length > 0;
          const userHasCountry =
            userProfile?.country && userProfile.country.trim().length > 0;
          addressVerified =
            userHasAddressLine1 || (userHasCity && userHasCountry);
        }

        setProfile({
          firstName: u.firstName,
          lastName: u.lastName,
          isVerified: isVerified,
          emailVerified: !!u.emailVerifiedAt,
          phoneVerified: !!u.phoneVerifiedAt,
          hasAddress: !!addressVerified,
        });
      }
    } catch (err) {
      console.log("Error fetching employer profile", err);
    }
  };

  const fetchActiveBooking = async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        console.log("No auth token found for booking fetch");
        return;
      }
      const base = getApiBase();
      console.log(
        "Fetching active bookings from:",
        `${base}/bookings/employer/me`,
      );

      // Fetch IN_PROGRESS bookings first
      const res = await fetch(
        `${base}/bookings/employer/me?status=IN_PROGRESS`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        console.log("IN_PROGRESS bookings:", data);
        if (data && data.length > 0) {
          console.log("Setting active booking (IN_PROGRESS):", data[0]);
          setActiveBooking(data[0]);
          return;
        }
      } else {
        console.log("Failed to fetch IN_PROGRESS bookings:", res.status);
      }

      // If no in-progress, check confirmed
      const res2 = await fetch(
        `${base}/bookings/employer/me?status=CONFIRMED`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res2.ok) {
        const data2 = await res2.json();
        console.log("CONFIRMED bookings:", data2);
        if (data2 && data2.length > 0) {
          console.log("Setting active booking (CONFIRMED):", data2[0]);
          setActiveBooking(data2[0]);
          return;
        }
      } else {
        console.log("Failed to fetch CONFIRMED bookings:", res2.status);
      }

      console.log("No active bookings found");
      setActiveBooking(null);
    } catch (e: any) {
      // Only log non-network errors to avoid noise when backend is unavailable
      if (e?.message && !e.message.includes("Network request failed")) {
        console.error("Error fetching active booking:", e);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchActiveBooking();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchActiveBooking();
    setRefreshing(false);
  };

  const handlePostJob = () => {
    if (
      !profile?.emailVerified ||
      !profile?.phoneVerified ||
      !profile?.hasAddress
    ) {
      const missing = [];
      if (!profile?.emailVerified) missing.push("Email");
      if (!profile?.phoneVerified) missing.push("Phone");
      if (!profile?.hasAddress) missing.push("Address");
      Alert.alert(
        "Verification Required",
        `Please complete your verification before posting jobs. Missing: ${missing.join(", ")}. Please go to Settings to complete your verification.`,
      );
      return;
    }
    router.push("/post-job" as never);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text}
            />
          }
        >
          {profile && (
            <EmailVerificationBanner
              emailVerified={profile?.emailVerified ?? true}
              onVerify={() => fetchProfile()}
            />
          )}

          {/* ─── HEADER ─── */}
          <View style={styles.header}>
            <View>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: isDark
                      ? "rgba(201,150,63,0.6)"
                      : "rgba(184,130,42,0.5)",
                  },
                ]}
              >
                EMPLOYER HQ
              </Text>
              <Text
                style={[
                  styles.welcomeText,
                  { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
                ]}
              >
                {t("home.welcome")},
              </Text>
              <Text style={[styles.nameText, { color: colors.tint }]}>
                {profile?.firstName || t("home.employer")}
              </Text>
            </View>
            {/* Status LED cluster */}
            <View style={styles.ledCluster}>
              <View style={styles.ledRow}>
                <View
                  style={[
                    styles.ledDot,
                    {
                      backgroundColor: profile?.emailVerified
                        ? "#22c55e"
                        : "#f59e0b",
                      shadowColor: profile?.emailVerified
                        ? "#22c55e"
                        : "#f59e0b",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.ledLabel,
                    { color: isDark ? "rgba(240,232,213,0.4)" : "#8A8278" },
                  ]}
                >
                  EMAIL
                </Text>
              </View>
              <View style={styles.ledRow}>
                <View
                  style={[
                    styles.ledDot,
                    {
                      backgroundColor: profile?.phoneVerified
                        ? "#22c55e"
                        : "#f59e0b",
                      shadowColor: profile?.phoneVerified
                        ? "#22c55e"
                        : "#f59e0b",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.ledLabel,
                    { color: isDark ? "rgba(240,232,213,0.4)" : "#8A8278" },
                  ]}
                >
                  PHONE
                </Text>
              </View>
              <View style={styles.ledRow}>
                <View
                  style={[
                    styles.ledDot,
                    {
                      backgroundColor: profile?.hasAddress
                        ? "#22c55e"
                        : "#f59e0b",
                      shadowColor: profile?.hasAddress ? "#22c55e" : "#f59e0b",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.ledLabel,
                    { color: isDark ? "rgba(240,232,213,0.4)" : "#8A8278" },
                  ]}
                >
                  ADDR
                </Text>
              </View>
            </View>
          </View>

          {/* ─── NAV SWITCH ─── */}
          <TouchableButton
            style={[
              styles.switchBtn,
              {
                backgroundColor: isDark
                  ? "rgba(12,22,42,0.85)"
                  : "rgba(255,250,240,0.92)",
                borderColor: isDark ? "rgba(201,150,63,0.3)" : "#D4A24E",
              },
            ]}
            onPress={() => router.push("/employer-tabs" as never)}
          >
            <Feather
              name="layout"
              size={14}
              color={isDark ? "#C9963F" : "#B8822A"}
            />
            <Text
              style={[
                styles.switchText,
                { color: isDark ? "#C9963F" : "#B8822A" },
              ]}
            >
              {t("home.nestaHome")}
            </Text>
            <Feather
              name="arrow-right"
              size={14}
              color={isDark ? "#C9963F" : "#B8822A"}
              style={{ marginLeft: "auto" }}
            />
          </TouchableButton>

          {/* ─── SECTION LABEL ─── */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? "rgba(201,150,63,0.6)" : "rgba(184,130,42,0.5)",
              },
            ]}
          >
            {t("home.quickActions")}
          </Text>

          {/* ─── MODULE: POST JOB ─── */}
          <View
            style={[
              styles.hudPanel,
              {
                backgroundColor: isDark
                  ? "rgba(12,22,42,0.85)"
                  : "rgba(255,250,240,0.92)",
                borderColor: isDark ? "rgba(201,150,63,0.3)" : "#D4A24E",
              },
            ]}
          >
            <View style={styles.panelHeader}>
              <View style={styles.panelLabelRow}>
                <Feather
                  name="plus-circle"
                  size={14}
                  color={isDark ? "#C9963F" : "#B8822A"}
                />
                <Text
                  style={[
                    styles.panelLabel,
                    {
                      color: isDark
                        ? "rgba(201,150,63,0.7)"
                        : "rgba(184,130,42,0.6)",
                    },
                  ]}
                >
                  NEW LISTING
                </Text>
              </View>
              {!profile?.isVerified && (
                <View
                  style={[
                    styles.alertBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(239,68,68,0.08)",
                      borderColor: isDark
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(239,68,68,0.2)",
                    },
                  ]}
                >
                  <Feather name="lock" size={10} color="#ef4444" />
                  <Text style={styles.alertBadgeText}>
                    {t("home.verificationRequired")}
                  </Text>
                </View>
              )}
              {profile?.isVerified && (
                <View
                  style={[
                    styles.ledDotSmall,
                    { backgroundColor: "#22c55e", shadowColor: "#22c55e" },
                  ]}
                />
              )}
            </View>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {t("home.postJob")}
            </Text>
            <Text
              style={[
                styles.panelDesc,
                { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
              ]}
            >
              {t("home.postJobDescription")}
            </Text>
            <TouchableButton
              style={[
                styles.tacticalBtn,
                profile?.isVerified
                  ? {
                      backgroundColor: isDark ? "#C9963F" : "#B8822A",
                      borderColor: isDark ? "#C9963F" : "#B8822A",
                    }
                  : {
                      backgroundColor: isDark
                        ? "rgba(201,150,63,0.1)"
                        : "rgba(184,130,42,0.05)",
                      borderColor: isDark
                        ? "rgba(201,150,63,0.2)"
                        : "rgba(184,130,42,0.15)",
                      opacity: 0.7,
                    },
              ]}
              onPress={handlePostJob}
              disabled={!profile?.isVerified}
            >
              <Feather
                name={profile?.isVerified ? "plus" : "lock"}
                size={14}
                color={
                  profile?.isVerified
                    ? isDark
                      ? "#0A1628"
                      : "#FFFFFF"
                    : isDark
                      ? "rgba(201,150,63,0.5)"
                      : "rgba(184,130,42,0.5)"
                }
              />
              <Text
                style={[
                  styles.tacticalBtnText,
                  {
                    color: profile?.isVerified
                      ? isDark
                        ? "#0A1628"
                        : "#FFFFFF"
                      : isDark
                        ? "rgba(201,150,63,0.5)"
                        : "rgba(184,130,42,0.5)",
                  },
                ]}
              >
                {profile?.isVerified
                  ? t("home.createListing")
                  : t("home.verifyToPost")}
              </Text>
            </TouchableButton>
          </View>

          {/* ─── MODULE: MANAGE APPLICATIONS ─── */}
          <View
            style={[
              styles.hudPanel,
              {
                backgroundColor: isDark
                  ? "rgba(12,22,42,0.85)"
                  : "rgba(255,250,240,0.92)",
                borderColor: isDark ? "rgba(201,150,63,0.3)" : "#D4A24E",
              },
            ]}
          >
            <View style={styles.panelHeader}>
              <View style={styles.panelLabelRow}>
                <Feather
                  name="users"
                  size={14}
                  color={isDark ? "#E8B86D" : "#B8822A"}
                />
                <Text
                  style={[
                    styles.panelLabel,
                    {
                      color: isDark
                        ? "rgba(201,150,63,0.7)"
                        : "rgba(184,130,42,0.6)",
                    },
                  ]}
                >
                  APPLICATIONS
                </Text>
              </View>
              <View
                style={[
                  styles.ledDotSmall,
                  { backgroundColor: "#22c55e", shadowColor: "#22c55e" },
                ]}
              />
            </View>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {t("home.manageApplications")}
            </Text>
            <Text
              style={[
                styles.panelDesc,
                { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
              ]}
            >
              {t("home.manageApplicationsDescription")}
            </Text>
            <TouchableButton
              style={[
                styles.tacticalBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(201,150,63,0.15)"
                    : "rgba(184,130,42,0.08)",
                  borderColor: isDark ? "rgba(201,150,63,0.4)" : "#D4A24E",
                },
              ]}
              onPress={() => router.push("/manage-applications" as never)}
            >
              <Text
                style={[
                  styles.tacticalBtnText,
                  { color: isDark ? "#C9963F" : "#B8822A" },
                ]}
              >
                {t("home.viewApplications")}
              </Text>
              <Feather
                name="arrow-right"
                size={14}
                color={isDark ? "#C9963F" : "#B8822A"}
              />
            </TouchableButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20 },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: -0.5,
  },

  /* ── LED Status ── */
  ledCluster: {
    gap: 6,
    alignItems: "flex-end",
    paddingTop: 18,
  },
  ledRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 0,
  },
  ledDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 0,
  },
  ledLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  /* ── Nav Switch ── */
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 24,
  },
  switchText: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  /* ── Section ── */
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 14,
    textTransform: "uppercase",
  },

  /* ── HUD Panel ── */
  hudPanel: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 0,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  panelLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  panelDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  /* ── Alert Badge ── */
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  alertBadgeText: {
    color: "#ef4444",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* ── Tactical Button ── */
  tacticalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 16,
    shadowColor: "#C9963F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 0,
  },
  tacticalBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
