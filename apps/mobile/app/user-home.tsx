import { View, Text, StyleSheet, Platform } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getApiBase } from "../lib/api";
import { TouchableButton } from "../components/TouchableButton";
import { Feather } from "@expo/vector-icons";
import { Fonts } from "../constants/theme";

export default function UserHome() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<
    | "PENDING"
    | "IN_PROGRESS"
    | "MANUAL_REVIEW"
    | "VERIFIED"
    | "APPROVED"
    | "FAILED"
    | "UNKNOWN"
  >("UNKNOWN");
  // Keep for future conditional UI (apply restrictions)
  // const isVerified = kycStatus === "VERIFIED";

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync("auth_token");
        if (!token) return;
        const base = getApiBase();
        // Load KYC status
        const res = await fetch(`${base}/kyc/my-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const status =
          json?.current?.status ||
          json?.user?.idVerificationStatus ||
          json?.status ||
          "UNKNOWN";
        setKycStatus(status);

        // Load user profile for greeting
        try {
          const meRes = await fetch(`${base}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const me = await meRes.json();
            const name =
              me?.name ||
              me?.fullName ||
              [me?.firstName, me?.lastName].filter(Boolean).join(" ");
            if (name) setDisplayName(name);
          } else {
            // Fallback endpoint
            const altRes = await fetch(`${base}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (altRes.ok) {
              const me = await altRes.json();
              const name =
                me?.name ||
                me?.fullName ||
                [me?.firstName, me?.lastName].filter(Boolean).join(" ");
              if (name) setDisplayName(name);
            }
          }
        } catch {
          // ignore profile errors
        }
      } catch {
        // Best-effort only; keep UNKNOWN
      }
    };
    loadStatus();
  }, []);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* ─── TOP BAR ─── */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* LED status dot */}
            <View
              style={[
                styles.ledDot,
                {
                  backgroundColor:
                    kycStatus === "VERIFIED" || kycStatus === "APPROVED"
                      ? "#22c55e"
                      : "#f59e0b",
                  shadowColor:
                    kycStatus === "VERIFIED" || kycStatus === "APPROVED"
                      ? "#22c55e"
                      : "#f59e0b",
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
              ]}
            >
              {kycStatus !== "UNKNOWN" ? kycStatus : "STANDBY"}
            </Text>
          </View>
          <TouchableButton
            style={[
              styles.topButton,
              {
                backgroundColor: isDark
                  ? "rgba(12,22,42,0.85)"
                  : "rgba(255,250,240,0.92)",
                borderColor: isDark ? "rgba(201,150,63,0.3)" : "#D4A24E",
              },
            ]}
            onPress={() => {
              SecureStore.deleteItemAsync("auth_token");
              router.replace("/");
            }}
          >
            <Feather
              name="log-out"
              size={14}
              color={isDark ? "#C9963F" : "#B8822A"}
            />
            <Text
              style={[
                styles.topButtonText,
                { color: isDark ? "#C9963F" : "#B8822A" },
              ]}
            >
              {t("settings.signOut")}
            </Text>
          </TouchableButton>
        </View>

        {/* ─── HEADER ─── */}
        <View style={styles.headerSection}>
          <Text
            style={[
              styles.sectionLabel,
              {
                color: isDark ? "rgba(201,150,63,0.6)" : "rgba(184,130,42,0.5)",
              },
            ]}
          >
            MISSION CONTROL
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("home.welcome")}
            {displayName ? `, ${displayName}` : ""}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
            ]}
          >
            {t("home.hereQuickStart")}
            {kycStatus !== "UNKNOWN" ? ` · ${t("home.kyc")}: ${kycStatus}` : ""}
          </Text>
        </View>

        <View style={styles.bentoGrid}>
          {/* ─── MODULE A: KYC / IDENTITY ─── */}
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
                  name="shield"
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
                  IDENTITY
                </Text>
              </View>
              <View
                style={[
                  styles.ledDotSmall,
                  {
                    backgroundColor:
                      kycStatus === "VERIFIED" || kycStatus === "APPROVED"
                        ? "#22c55e"
                        : "#f59e0b",
                    shadowColor:
                      kycStatus === "VERIFIED" || kycStatus === "APPROVED"
                        ? "#22c55e"
                        : "#f59e0b",
                  },
                ]}
              />
            </View>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {t("kyc.verifyIdentity")}
            </Text>
            <Text
              style={[
                styles.panelDesc,
                { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
              ]}
            >
              {t("kyc.verifyIdentitySubtitle")}
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
              onPress={() => router.replace("/kyc-start" as never)}
            >
              <Text
                style={[
                  styles.tacticalBtnText,
                  { color: isDark ? "#C9963F" : "#B8822A" },
                ]}
              >
                {t("kyc.startVerification")}
              </Text>
              <Feather
                name="arrow-right"
                size={14}
                color={isDark ? "#C9963F" : "#B8822A"}
              />
            </TouchableButton>
          </View>

          {/* ─── MODULE B: HERO — JOB SCANNER ─── */}
          <View
            style={[
              styles.hudPanel,
              styles.heroPanel,
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
                  name="radio"
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
                  TACTICAL SCANNER
                </Text>
              </View>
              <View
                style={[
                  styles.ledDotSmall,
                  { backgroundColor: "#22c55e", shadowColor: "#22c55e" },
                ]}
              />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              {(() => {
                const key = "jobs.searchJobs";
                const translated = t(key);
                return translated === key ? "Search Jobs" : translated;
              })()}
            </Text>
            <Text
              style={[
                styles.panelDesc,
                { color: isDark ? "rgba(240,232,213,0.5)" : "#6B6355" },
              ]}
            >
              {(() => {
                const key = "landing.findJobsDescription";
                const translated = t(key);
                return translated === key
                  ? "Discover opportunities that match your skills"
                  : translated;
              })()}
            </Text>
            {/* Decorative scan bar */}
            <View
              style={[
                styles.scanBar,
                {
                  backgroundColor: isDark
                    ? "rgba(201,150,63,0.1)"
                    : "rgba(184,130,42,0.04)",
                },
              ]}
            >
              <View
                style={[
                  styles.scanBarFill,
                  { backgroundColor: isDark ? "#C9963F" : "#B8822A" },
                ]}
              />
            </View>
            <TouchableButton
              style={[
                styles.heroCta,
                {
                  backgroundColor: isDark ? "#C9963F" : "#B8822A",
                },
              ]}
              onPress={() => router.push("/(tabs)/feed" as never)}
            >
              <Feather
                name="search"
                size={16}
                color={isDark ? "#0A1628" : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.heroCtaText,
                  { color: isDark ? "#0A1628" : "#FFFFFF" },
                ]}
              >
                {(() => {
                  const key = "jobs.searchJobs";
                  const translated = t(key);
                  return translated === key ? "Search Jobs" : translated;
                })()}
              </Text>
            </TouchableButton>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20 },

  /* ── Top Bar ── */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  topButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topButtonText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  /* ── LED Dots ── */
  ledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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

  /* ── Header ── */
  headerSection: {
    marginTop: 24,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 0.3,
    lineHeight: 18,
  },

  /* ── Bento Grid ── */
  bentoGrid: {
    flex: 1,
    gap: 12,
  },

  /* ── HUD Panels ── */
  hudPanel: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 20,
    // Glassmorphism shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 0,
  },
  heroPanel: {
    flex: 1,
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

  /* ── Tactical Button ── */
  tacticalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 12,
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

  /* ── Hero Panel ── */
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  scanBar: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: 16,
    overflow: "hidden",
  },
  scanBarFill: {
    width: "60%",
    height: "100%",
    borderRadius: 1.5,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#C9963F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 0,
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
