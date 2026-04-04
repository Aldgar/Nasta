import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

type Props = {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

const isAndroid = Platform.OS === "android";

export default function GradientBackground({ children, contentStyle }: Props) {
  let isDark = false;
  try {
    const theme = useTheme();
    isDark = theme?.isDark || false;
  } catch (err) {
    console.log("GradientBackground: Theme context error:", err);
    isDark = false;
  }

  if (isAndroid) {
    // Android: use a simplified 3-stop gradient — much cheaper to render
    // on older GPUs. Skip the second overlay layer and scan-line entirely.
    const darkSimple = ["#080F1E", "#0A1628", "#0C1322"] as const;
    const lightSimple = ["#F7ECD2", "#F5E6C8", "#E2C894"] as const;
    const colors = (isDark ? darkSimple : lightSimple) as unknown as [
      string,
      string,
      ...string[],
    ];

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={colors}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    );
  }

  // iOS: full 6-stop gradient + overlay for richer visual effect
  const darkColors = [
    "#080F1E",
    "#0A1628",
    "#0D1A30",
    "#0E1B32",
    "#10182C",
    "#0C1322",
  ] as const;

  const lightColors = [
    "#F7ECD2",
    "#F5E6C8",
    "#F0DEBB",
    "#EEDCB0",
    "#E8D0A0",
    "#E2C894",
  ] as const;

  const gradientColors = (isDark ? darkColors : lightColors) as unknown as [
    string,
    string,
    ...string[],
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.15, 0.35, 0.55, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <LinearGradient
        colors={
          isDark
            ? ([
                "rgba(201, 150, 63, 0.04)",
                "transparent",
                "rgba(201, 150, 63, 0.02)",
              ] as unknown as [string, string, ...string[]])
            : ([
                "rgba(184, 130, 42, 0.03)",
                "transparent",
                "rgba(184, 130, 42, 0.02)",
              ] as unknown as [string, string, ...string[]])
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {isDark && <View style={styles.scanLine} />}

      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(201, 150, 63, 0.12)",
  },
});
