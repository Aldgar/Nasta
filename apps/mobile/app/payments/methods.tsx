import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useStripeAvailability } from "../../context/StripeContext";
import { getApiBase } from "../../lib/api";

type PaymentMethod = {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  isDefault: boolean;
  created: number;
};

export default function PaymentMethodsScreen() {
  const { isStripeReady } = useStripeAvailability();

  if (!isStripeReady) {
    return <PaymentMethodsFallback />;
  }

  return <PaymentMethodsInner />;
}

function PaymentMethodsFallback() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) return;

      const baseUrl = getApiBase();
      const response = await fetch(`${baseUrl}/payments/payment-methods`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: t("payments.failedToFetchPaymentMethods"),
          }));
        throw new Error(
          errorData.message || t("payments.failedToFetchPaymentMethods"),
        );
      }

      const data = await response.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      if (!refreshing) {
        Alert.alert(
          t("common.error"),
          error?.message || t("payments.unableToFetchPaymentMethods"),
        );
      }
    }
  }, [refreshing]);

  const handleAddViaCheckout = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
        return;
      }

      const baseUrl = getApiBase();
      const response = await fetch(`${baseUrl}/payments/checkout/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: "setup",
          successUrl:
            "https://nasta.app/dashboard/employer/payments?tab=methods",
          cancelUrl:
            "https://nasta.app/dashboard/employer/payments?tab=methods",
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: t("payments.failedToFetchPaymentConfig") }));
        throw new Error(
          errorData.message || t("payments.failedToFetchPaymentConfig"),
        );
      }

      const data = await response.json();
      if (!data.url) {
        Alert.alert(
          t("common.error"),
          t("applications.invalidPaymentResponse"),
        );
        return;
      }

      await WebBrowser.openBrowserAsync(data.url, {
        dismissButtonStyle: "done",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });

      // Refresh payment methods after returning from browser
      await fetchPaymentMethods();
    } catch (error: any) {
      console.error("Error opening checkout:", error);
      Alert.alert(
        t("common.error"),
        error?.message || t("payments.failedToOpenPaymentSheet"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    Alert.alert(
      t("payments.deletePaymentMethod"),
      t("payments.deletePaymentMethodConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(paymentMethodId);
              const token = await SecureStore.getItemAsync("auth_token");
              if (!token) {
                Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
                return;
              }

              const baseUrl = getApiBase();
              const response = await fetch(
                `${baseUrl}/payments/payment-methods/${paymentMethodId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!response.ok) {
                const errorData = await response
                  .json()
                  .catch(() => ({
                    message: t("payments.failedToDeletePaymentMethod"),
                  }));
                throw new Error(
                  errorData.message ||
                    t("payments.failedToDeletePaymentMethod"),
                );
              }

              Alert.alert(
                t("common.success"),
                t("payments.paymentMethodDeletedSuccessfully"),
              );
              await fetchPaymentMethods();
            } catch (error: any) {
              console.error("Error deleting payment method:", error);
              Alert.alert(
                t("common.error"),
                error?.message || t("payments.failedToDeletePaymentMethod"),
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setSettingDefaultId(paymentMethodId);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
        return;
      }

      const baseUrl = getApiBase();
      const response = await fetch(
        `${baseUrl}/payments/payment-methods/${paymentMethodId}/set-default`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: t("payments.failedToSetDefaultPaymentMethod"),
          }));
        throw new Error(
          errorData.message || t("payments.failedToSetDefaultPaymentMethod"),
        );
      }

      Alert.alert(
        t("common.success"),
        t("payments.defaultPaymentMethodUpdatedSuccessfully"),
      );
      await fetchPaymentMethods();
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      Alert.alert(
        t("common.error"),
        error?.message || t("payments.failedToSetDefaultPaymentMethod"),
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaymentMethods();
    setRefreshing(false);
  }, [fetchPaymentMethods]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPaymentMethods();
    }, [fetchPaymentMethods]),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("payments.paymentMethods")}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
      >
        <View style={styles.content}>
          <Text
            style={[styles.subtitle, { color: isDark ? "#B8A88A" : "#64748B" }]}
          >
            {t("payments.managePaymentMethodsDescription")}
          </Text>

          {paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method) => (
                <View
                  key={method.id}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: isDark
                        ? method.isDefault
                          ? "rgba(201, 150, 63, 0.15)"
                          : "rgba(255, 250, 240, 0.10)"
                        : method.isDefault
                          ? "#f0f4ff"
                          : "#ffffff",
                      borderColor: method.isDefault
                        ? isDark
                          ? "#38BDF8"
                          : "#0284C7"
                        : isDark
                          ? "rgba(255, 250, 240, 0.12)"
                          : "#F0E8D5",
                    },
                  ]}
                >
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <View style={styles.cardDetails}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[styles.cardBrand, { color: colors.text }]}
                          >
                            {method.card
                              ? formatCardBrand(method.card.brand)
                              : t("payments.card")}
                          </Text>
                          {method.isDefault && (
                            <View
                              style={[
                                styles.defaultBadge,
                                {
                                  backgroundColor: isDark
                                    ? "#38BDF8"
                                    : "#0284C7",
                                },
                              ]}
                            >
                              <Text style={styles.defaultBadgeText}>
                                {t("payments.default")}
                              </Text>
                            </View>
                          )}
                        </View>
                        {method.card && (
                          <Text
                            style={[styles.cardNumber, { color: colors.text }]}
                          >
                            •••• •••• •••• {method.card.last4}
                          </Text>
                        )}
                        {method.card && (
                          <Text
                            style={[
                              styles.cardExpiry,
                              { color: isDark ? "#9A8E7A" : "#64748b" },
                            ]}
                          >
                            {t("payments.expires")}{" "}
                            {String(method.card.expMonth).padStart(2, "0")}/
                            {method.card.expYear}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.setDefaultButton,
                          {
                            backgroundColor: isDark
                              ? "rgba(201, 150, 63, 0.2)"
                              : "#FFF8ED",
                            borderColor: isDark
                              ? "rgba(201, 150, 63, 0.3)"
                              : "#D4C9B0",
                          },
                          settingDefaultId === method.id &&
                            styles.actionButtonDisabled,
                        ]}
                        onPress={() => handleSetDefault(method.id)}
                        disabled={settingDefaultId === method.id}
                      >
                        {settingDefaultId === method.id ? (
                          <ActivityIndicator
                            size="small"
                            color={isDark ? "#38BDF8" : "#0284C7"}
                          />
                        ) : (
                          <>
                            <Feather
                              name="star"
                              size={16}
                              color={isDark ? "#38BDF8" : "#0284C7"}
                            />
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: isDark ? "#38BDF8" : "#0284C7" },
                              ]}
                            >
                              {t("payments.setDefault")}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.deleteButton,
                        {
                          backgroundColor: isDark
                            ? "rgba(239, 68, 68, 0.15)"
                            : "#fef2f2",
                          borderColor: isDark
                            ? "rgba(239, 68, 68, 0.3)"
                            : "#fecaca",
                        },
                        deletingId === method.id && styles.actionButtonDisabled,
                      ]}
                      onPress={() => handleDelete(method.id)}
                      disabled={deletingId === method.id}
                    >
                      {deletingId === method.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <Feather name="trash-2" size={16} color="#ef4444" />
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: "#ef4444" },
                            ]}
                          >
                            {t("common.delete")}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Feather
                name="credit-card"
                size={64}
                color={
                  isDark
                    ? "rgba(255, 250, 240, 0.15)"
                    : "rgba(184, 130, 42, 0.3)"
                }
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#9A8E7A" : "#64748b" },
                ]}
              >
                {t("payments.noPaymentMethodsYet")}
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: isDark ? "#64748b" : "#9A8E7A" },
                ]}
              >
                {t("payments.addPaymentMethodToGetStarted")}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: isDark ? "#38BDF8" : "#0284C7",
                shadowColor: isDark ? "#38BDF8" : "#0284C7",
              },
              loading && styles.addButtonDisabled,
            ]}
            onPress={handleAddViaCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={22} color="white" />
                <Text style={styles.btnText}>
                  {t("payments.addPaymentMethod")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PaymentMethodsInner() {
  const { useStripe } = require("@stripe/stripe-react-native");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
        return;
      }

      const baseUrl = getApiBase();
      const response = await fetch(`${baseUrl}/payments/payment-methods`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: t("payments.failedToFetchPaymentMethods"),
          }));
        throw new Error(
          errorData.message || t("payments.failedToFetchPaymentMethods"),
        );
      }

      const data = await response.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      if (!refreshing) {
        Alert.alert(
          t("common.error"),
          error?.message || t("payments.unableToFetchPaymentMethods"),
        );
      }
    }
  }, [refreshing]);

  const fetchPaymentSheetParams = async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
        return null;
      }

      const baseUrl = getApiBase();
      const response = await fetch(`${baseUrl}/payments/setup-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: t("payments.failedToFetchPaymentConfig") }));
        throw new Error(
          errorData.message || t("payments.failedToFetchPaymentConfig"),
        );
      }

      const data = await response.json();

      if (!data.clientSecret || !data.ephemeralKey || !data.customer) {
        throw new Error("Invalid response from server");
      }

      return {
        clientSecret: data.clientSecret,
        ephemeralKey: data.ephemeralKey,
        customer: data.customer,
      };
    } catch (error: any) {
      console.error("Error fetching payment config:", error);
      Alert.alert(
        t("common.error"),
        error?.message || t("payments.unableToFetchPaymentConfig"),
      );
      return null;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      setInitializing(true);
      const params = await fetchPaymentSheetParams();
      if (!params) {
        setInitializing(false);
        return;
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Nasta",
        customerId: params.customer,
        customerEphemeralKeySecret: params.ephemeralKey,
        setupIntentClientSecret: params.clientSecret,
        returnURL: "nasta://payments/methods",
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "Cardholder",
        },
      });

      if (error) {
        console.error("Payment sheet init error:", error);
        Alert.alert(t("common.error"), error.message);
        setInitializing(false);
      } else {
        setReady(true);
        setInitializing(false);
      }
    } catch (error: any) {
      console.error("Error initializing payment sheet:", error);
      Alert.alert(
        t("common.error"),
        error?.message || t("payments.failedToInitializePaymentSheet"),
      );
      setInitializing(false);
    }
  };

  const openPaymentSheet = async () => {
    if (!ready) {
      Alert.alert(
        t("payments.pleaseWait"),
        t("payments.paymentSystemInitializing"),
      );
      return;
    }

    try {
      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== "Canceled") {
          Alert.alert(t("common.error"), error.message);
        }
      } else {
        Alert.alert(
          t("common.success"),
          t("payments.paymentMethodAddedSuccessfully"),
        );
        // Refresh payment methods and re-initialize
        setReady(false);
        await fetchPaymentMethods();
        await initializePaymentSheet();
      }
    } catch (error: any) {
      console.error("Error presenting payment sheet:", error);
      Alert.alert(
        t("common.error"),
        error?.message || t("payments.failedToOpenPaymentSheet"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    Alert.alert(
      t("payments.deletePaymentMethod"),
      t("payments.deletePaymentMethodConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(paymentMethodId);
              const token = await SecureStore.getItemAsync("auth_token");
              if (!token) {
                Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
                return;
              }

              const baseUrl = getApiBase();
              const response = await fetch(
                `${baseUrl}/payments/payment-methods/${paymentMethodId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!response.ok) {
                const errorData = await response
                  .json()
                  .catch(() => ({
                    message: t("payments.failedToDeletePaymentMethod"),
                  }));
                throw new Error(
                  errorData.message ||
                    t("payments.failedToDeletePaymentMethod"),
                );
              }

              Alert.alert(
                t("common.success"),
                t("payments.paymentMethodDeletedSuccessfully"),
              );
              await fetchPaymentMethods();
            } catch (error: any) {
              console.error("Error deleting payment method:", error);
              Alert.alert(
                t("common.error"),
                error?.message || t("payments.failedToDeletePaymentMethod"),
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setSettingDefaultId(paymentMethodId);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        Alert.alert(t("common.error"), t("chat.pleaseLoginToContinue"));
        return;
      }

      const baseUrl = getApiBase();
      const response = await fetch(
        `${baseUrl}/payments/payment-methods/${paymentMethodId}/set-default`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: t("payments.failedToSetDefaultPaymentMethod"),
          }));
        throw new Error(
          errorData.message || t("payments.failedToSetDefaultPaymentMethod"),
        );
      }

      Alert.alert(
        t("common.success"),
        t("payments.defaultPaymentMethodUpdatedSuccessfully"),
      );
      await fetchPaymentMethods();
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      Alert.alert(
        t("common.error"),
        error?.message || t("payments.failedToSetDefaultPaymentMethod"),
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaymentMethods();
    setRefreshing(false);
  }, [fetchPaymentMethods]);

  useEffect(() => {
    initializePaymentSheet();
    fetchPaymentMethods();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPaymentMethods();
    }, [fetchPaymentMethods]),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("payments.paymentMethods")}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
      >
        <View style={styles.content}>
          <Text
            style={[styles.subtitle, { color: isDark ? "#B8A88A" : "#64748B" }]}
          >
            {t("payments.managePaymentMethodsDescription")}
          </Text>

          {/* Payment Methods List */}
          {paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method) => (
                <View
                  key={method.id}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: isDark
                        ? method.isDefault
                          ? "rgba(201, 150, 63, 0.15)"
                          : "rgba(255, 250, 240, 0.10)"
                        : method.isDefault
                          ? "#f0f4ff"
                          : "#ffffff",
                      borderColor: method.isDefault
                        ? isDark
                          ? "#38BDF8"
                          : "#0284C7"
                        : isDark
                          ? "rgba(255, 250, 240, 0.12)"
                          : "#F0E8D5",
                    },
                  ]}
                >
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <View style={styles.cardDetails}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[styles.cardBrand, { color: colors.text }]}
                          >
                            {method.card
                              ? formatCardBrand(method.card.brand)
                              : t("payments.card")}
                          </Text>
                          {method.isDefault && (
                            <View
                              style={[
                                styles.defaultBadge,
                                {
                                  backgroundColor: isDark
                                    ? "#38BDF8"
                                    : "#0284C7",
                                },
                              ]}
                            >
                              <Text style={styles.defaultBadgeText}>
                                {t("payments.default")}
                              </Text>
                            </View>
                          )}
                        </View>
                        {method.card && (
                          <Text
                            style={[styles.cardNumber, { color: colors.text }]}
                          >
                            •••• •••• •••• {method.card.last4}
                          </Text>
                        )}
                        {method.card && (
                          <Text
                            style={[
                              styles.cardExpiry,
                              { color: isDark ? "#9A8E7A" : "#64748b" },
                            ]}
                          >
                            {t("payments.expires")}{" "}
                            {String(method.card.expMonth).padStart(2, "0")}/
                            {method.card.expYear}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.setDefaultButton,
                          {
                            backgroundColor: isDark
                              ? "rgba(201, 150, 63, 0.2)"
                              : "#FFF8ED",
                            borderColor: isDark
                              ? "rgba(201, 150, 63, 0.3)"
                              : "#D4C9B0",
                          },
                          settingDefaultId === method.id &&
                            styles.actionButtonDisabled,
                        ]}
                        onPress={() => handleSetDefault(method.id)}
                        disabled={settingDefaultId === method.id}
                      >
                        {settingDefaultId === method.id ? (
                          <ActivityIndicator
                            size="small"
                            color={isDark ? "#38BDF8" : "#0284C7"}
                          />
                        ) : (
                          <>
                            <Feather
                              name="star"
                              size={16}
                              color={isDark ? "#38BDF8" : "#0284C7"}
                            />
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: isDark ? "#38BDF8" : "#0284C7" },
                              ]}
                            >
                              {t("payments.setDefault")}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.deleteButton,
                        {
                          backgroundColor: isDark
                            ? "rgba(239, 68, 68, 0.15)"
                            : "#fef2f2",
                          borderColor: isDark
                            ? "rgba(239, 68, 68, 0.3)"
                            : "#fecaca",
                        },
                        deletingId === method.id && styles.actionButtonDisabled,
                      ]}
                      onPress={() => handleDelete(method.id)}
                      disabled={deletingId === method.id}
                    >
                      {deletingId === method.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <Feather name="trash-2" size={16} color="#ef4444" />
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: "#ef4444" },
                            ]}
                          >
                            {t("common.delete")}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Feather
                name="credit-card"
                size={64}
                color={
                  isDark
                    ? "rgba(255, 250, 240, 0.15)"
                    : "rgba(184, 130, 42, 0.3)"
                }
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#9A8E7A" : "#64748b" },
                ]}
              >
                {t("payments.noPaymentMethodsYet")}
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: isDark ? "#64748b" : "#9A8E7A" },
                ]}
              >
                {t("payments.addPaymentMethodToGetStarted")}
              </Text>
            </View>
          )}

          {/* Add Payment Method Button */}
          {initializing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {t("payments.settingUpPaymentSystem")}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: isDark ? "#38BDF8" : "#0284C7",
                  shadowColor: isDark ? "#38BDF8" : "#0284C7",
                },
                (!ready || loading) && styles.addButtonDisabled,
              ]}
              onPress={openPaymentSheet}
              disabled={!ready || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={22} color="white" />
                  <Text style={styles.btnText}>
                    {t("payments.addPaymentMethod")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(184, 130, 42, 0.2)",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    padding: 24,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  methodsList: {
    gap: 16,
    marginBottom: 24,
  },
  methodCard: {
    borderRadius: 4,
    padding: 20,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 0,
  },
  methodHeader: {
    marginBottom: 16,
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardBrand: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 2,
  },
  cardExpiry: {
    fontSize: 14,
    fontWeight: "500",
  },
  methodActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(184, 130, 42, 0.06)",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  setDefaultButton: {},
  deleteButton: {},
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 0,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  stripeUnavailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  stripeUnavailableTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },
  stripeUnavailableText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
