import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getLegalDocument } from "../lib/legal-text";
import { getGuideDocument } from "../lib/guide-text";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LegalMenuScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [employerExpanded, setEmployerExpanded] = useState(false);
  const [providerExpanded, setProviderExpanded] = useState(false);

  const legalItems = [
    {
      title: t("legal.termsAndConditions"),
      route: "/content-page",
      params: {
        pageKey: "terms",
        title: t("legal.termsAndConditions"),
        content: getLegalDocument("TERMS_OF_SERVICE", language),
        showAccept: true,
      },
    },
    {
      title: t("legal.privacyPolicy"),
      route: "/content-page",
      params: {
        pageKey: "privacy",
        title: t("legal.privacyPolicy"),
        content: getLegalDocument("PRIVACY_POLICY", language),
        showAccept: true,
      },
    },
    {
      title: t("legal.cookiesSettings"),
      route: "/cookies-settings",
    },
    {
      title: t("legal.platformRules"),
      route: "/content-page",
      params: {
        pageKey: "platform_rules",
        title: t("legal.platformRules"),
        content: getLegalDocument("PLATFORM_RULES", language),
        showAccept: true,
      },
    },
  ];

  const usageTopItems = [
    {
      title: t("guide.about"),
      route: "/content-page",
      params: {
        pageKey: "about",
        title: t("guide.about"),
        content: getGuideDocument("ABOUT", language),
      },
    },
    {
      title: t("guide.howItWorks"),
      route: "/content-page",
      params: {
        pageKey: "how_it_works",
        title: t("guide.howItWorks"),
        content: getGuideDocument("HOW_IT_WORKS", language),
      },
    },
  ];

  const employerSubItems = [
    {
      title: t("guide.employerPostJob"),
      route: "/content-page",
      params: {
        pageKey: "employer_post_job",
        title: t("guide.employerPostJob"),
        content: getGuideDocument("EMPLOYER_POST_JOB", language),
      },
    },
    {
      title: t("guide.employerInstantJobs"),
      route: "/content-page",
      params: {
        pageKey: "employer_instant_jobs",
        title: t("guide.employerInstantJobs"),
        content: getGuideDocument("EMPLOYER_INSTANT_JOBS", language),
      },
    },
    {
      title: t("guide.employerNegotiation"),
      route: "/content-page",
      params: {
        pageKey: "employer_negotiation",
        title: t("guide.employerNegotiation"),
        content: getGuideDocument("EMPLOYER_NEGOTIATION", language),
      },
    },
    {
      title: t("guide.employerRefund"),
      route: "/content-page",
      params: {
        pageKey: "employer_refund",
        title: t("guide.employerRefund"),
        content: getGuideDocument("EMPLOYER_REFUND", language),
      },
    },
    {
      title: t("guide.employerNoShow"),
      route: "/content-page",
      params: {
        pageKey: "employer_no_show",
        title: t("guide.employerNoShow"),
        content: getGuideDocument("EMPLOYER_NO_SHOW", language),
      },
    },
  ];

  const providerSubItems = [
    {
      title: t("guide.spKyc"),
      route: "/content-page",
      params: {
        pageKey: "sp_kyc",
        title: t("guide.spKyc"),
        content: getGuideDocument("SP_KYC", language),
      },
    },
    {
      title: t("guide.spApplyJobs"),
      route: "/content-page",
      params: {
        pageKey: "sp_apply_jobs",
        title: t("guide.spApplyJobs"),
        content: getGuideDocument("SP_APPLY_JOBS", language),
      },
    },
    {
      title: t("guide.spSkills"),
      route: "/content-page",
      params: {
        pageKey: "sp_skills",
        title: t("guide.spSkills"),
        content: getGuideDocument("SP_SKILLS", language),
      },
    },
    {
      title: t("guide.spAvailability"),
      route: "/content-page",
      params: {
        pageKey: "sp_availability",
        title: t("guide.spAvailability"),
        content: getGuideDocument("SP_AVAILABILITY", language),
      },
    },
    {
      title: t("guide.spAccepting"),
      route: "/content-page",
      params: {
        pageKey: "sp_accepting",
        title: t("guide.spAccepting"),
        content: getGuideDocument("SP_ACCEPTING", language),
      },
    },
    {
      title: t("guide.spNegotiation"),
      route: "/content-page",
      params: {
        pageKey: "sp_negotiation",
        title: t("guide.spNegotiation"),
        content: getGuideDocument("SP_NEGOTIATION", language),
      },
    },
    {
      title: t("guide.spNoShow"),
      route: "/content-page",
      params: {
        pageKey: "sp_no_show",
        title: t("guide.spNoShow"),
        content: getGuideDocument("SP_NO_SHOW", language),
      },
    },
  ];

  const handlePress = (item: any) => {
    router.push({ pathname: item.route, params: item.params } as any);
  };

  const toggleSection = (section: "employer" | "provider") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === "employer") {
      setEmployerExpanded((prev) => !prev);
    } else {
      setProviderExpanded((prev) => !prev);
    }
  };

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>{title}</Text>
      <View style={[styles.menuList, themeStyles.listBg]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              themeStyles.itemBorder,
              index === items.length - 1 && styles.lastMenuItem,
            ]}
            onPress={() => handlePress(item)}
          >
            <Text style={[styles.menuText, themeStyles.text]}>
              {item.title}
            </Text>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "rgba(201,150,63,0.3)" : "rgba(0,0,0,0.3)"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCollapsibleItem = (
    title: string,
    expanded: boolean,
    onToggle: () => void,
    subItems: any[],
    isLast: boolean,
  ) => (
    <View>
      <TouchableOpacity
        style={[
          styles.menuItem,
          themeStyles.itemBorder,
          !expanded && isLast && styles.lastMenuItem,
        ]}
        onPress={onToggle}
      >
        <Text style={[styles.menuText, themeStyles.text]}>{title}</Text>
        <Feather
          name={expanded ? "chevron-down" : "chevron-right"}
          size={20}
          color={isDark ? "rgba(201,150,63,0.5)" : "rgba(0,0,0,0.4)"}
        />
      </TouchableOpacity>
      {expanded &&
        subItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.subMenuItem,
              themeStyles.itemBorder,
              index === subItems.length - 1 && isLast && styles.lastMenuItem,
            ]}
            onPress={() => handlePress(item)}
          >
            <View style={styles.subMenuRow}>
              <View
                style={[
                  styles.subMenuDot,
                  {
                    backgroundColor: isDark
                      ? "rgba(201,150,63,0.4)"
                      : "rgba(184,130,42,0.35)",
                  },
                ]}
              />
              <Text style={[styles.subMenuText, themeStyles.text]}>
                {item.title}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={isDark ? "rgba(201,150,63,0.25)" : "rgba(0,0,0,0.25)"}
            />
          </TouchableOpacity>
        ))}
    </View>
  );

  const renderUsageSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>
        {t("guide.usage")}
      </Text>
      <View style={[styles.menuList, themeStyles.listBg]}>
        {usageTopItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, themeStyles.itemBorder]}
            onPress={() => handlePress(item)}
          >
            <Text style={[styles.menuText, themeStyles.text]}>
              {item.title}
            </Text>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "rgba(201,150,63,0.3)" : "rgba(0,0,0,0.3)"}
            />
          </TouchableOpacity>
        ))}
        {renderCollapsibleItem(
          t("guide.forEmployers"),
          employerExpanded,
          () => toggleSection("employer"),
          employerSubItems,
          false,
        )}
        {renderCollapsibleItem(
          t("guide.forServiceProviders"),
          providerExpanded,
          () => toggleSection("provider"),
          providerSubItems,
          true,
        )}
      </View>
    </View>
  );

  const themeStyles = {
    text: { color: colors.text },
    backData: { color: colors.text },
    listBg: {
      backgroundColor: isDark ? "rgba(255,250,240,0.06)" : "#FFFAF0",
      borderColor: isDark ? "rgba(201,150,63,0.12)" : "rgba(0,0,0,0.08)",
      shadowColor: isDark ? "#000" : "#000",
    },
    itemBorder: {
      borderBottomColor: isDark
        ? "rgba(255,250,240,0.06)"
        : "rgba(184,130,42,0.06)",
    },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather
            name="arrow-left"
            size={24}
            color={themeStyles.backData.color}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themeStyles.text]}>
          {t("legal.supportAndLegal")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderSection(t("legal.legal"), legalItems)}
        {renderUsageSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuList: {
    borderRadius: 4,
    paddingVertical: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
  subMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingLeft: 36,
    paddingRight: 20,
    borderBottomWidth: 1,
  },
  subMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subMenuDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 12,
  },
  subMenuText: {
    fontSize: 15,
    fontWeight: "400",
  },
});
