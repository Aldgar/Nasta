import { Tabs, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { getApiBase } from "../../lib/api";
import { getValidToken, decodeJwtPayload } from "../../lib/authFetch";

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const insets = useSafeAreaInsets();

  // Role guard: only JOB_SEEKER (Service Provider) can access SP tabs
  useEffect(() => {
    const checkRole = async () => {
      const token = await getValidToken();
      if (!token) return;
      const payload = decodeJwtPayload(token);
      const role = String(payload?.role || "").toUpperCase();
      if (role === "EMPLOYER") {
        router.replace("/employer-home" as never);
      } else if (role === "ADMIN") {
        router.replace("/admin-home" as never);
      }
    };
    checkRole();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = await getValidToken();
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const base = getApiBase();
      const res = await fetch(`${base}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const count = data.count || 0;
        setUnreadCount(count);
      } else if (res.status === 401) {
        // Token is invalid or expired - silently set count to 0
        setUnreadCount(0);
      } else {
        // Other errors - silently fail, keep current count
      }
    } catch (error: any) {
      // Only log network errors in dev mode to avoid spam
      if (__DEV__) {
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes("Network request failed")) {
          console.warn(
            `[API] Network request failed. Make sure your server is running and accessible. ` +
              `Current API base: ${getApiBase()}. ` +
              `If using a physical device, ensure EXPO_PUBLIC_API_BASE_URL is set to your machine's IP.`,
          );
        } else {
          console.error("❌ Error fetching unread count:", error);
        }
      }
    }
  };

  // Fetch on mount and when screen is focused
  React.useEffect(() => {
    fetchUnreadCount();
    // Refresh count every 30 seconds (reduced frequency to avoid excessive logging)
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

  // Debug log
  React.useEffect(() => {
    console.log("📊 Unread count updated:", unreadCount);
  }, [unreadCount]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#0A1628" : "#F5E6C8",
          borderTopColor:
            colorScheme === "dark"
              ? "rgba(201, 150, 63, 0.2)"
              : "rgba(212, 162, 78, 0.3)",
          borderTopWidth: 1,
          ...(Platform.OS === "android" && {
            paddingBottom: Math.max(insets.bottom, 12),
            height: 60 + Math.max(insets.bottom, 12),
          }),
        },
      }}
    >
      {/* Hide legacy feed route if present */}
      <Tabs.Screen
        name="feed"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("navigation.home"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("navigation.explore"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: t("navigation.myApplications"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="locate" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: t("navigation.contact"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="call" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: t("navigation.settings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t("navigation.updates"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={24} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle:
            unreadCount > 0
              ? {
                  backgroundColor: "#ef4444",
                  color: "#FFFAF0",
                  fontSize: 12,
                  minWidth: 18,
                  height: 18,
                  lineHeight: 18,
                }
              : undefined,
        }}
        key={`notifications-${unreadCount}`}
      />
    </Tabs>
  );
}
