import { Platform, ViewStyle, TextStyle, ScrollViewProps } from 'react-native';

const isAndroid = Platform.OS === 'android';

/**
 * Utility to remove Android's default square shadow/elevation that creates visible squares
 * Use this for all cards, buttons, and interactive elements on Android
 */
export const androidNoElevation = (style: ViewStyle = {}): ViewStyle => {
  if (isAndroid) {
    return {
      ...style,
      elevation: 0,
      overflow: 'hidden' as const,
    };
  }
  return style;
};

/**
 * Helper to conditionally apply elevation only on iOS
 */
export const conditionalElevation = (iosElevation: number, androidElevation: number = 0) => {
  return isAndroid ? androidElevation : iosElevation;
};

/**
 * Props to spread onto ScrollView / FlatList for better Android perf on old devices.
 * - removeClippedSubviews: lets RN detach off-screen views from the native hierarchy
 * - overScrollMode: avoids the expensive over-scroll glow on old Samsung/LG devices
 * - scrollEventThrottle: reduces bridge traffic for onScroll
 */
export const androidScrollProps: Partial<ScrollViewProps> = isAndroid
  ? {
      removeClippedSubviews: true,
      overScrollMode: 'never' as const,
      scrollEventThrottle: 32,
      nestedScrollEnabled: true,
    }
  : {};

/**
 * Text style adjustments for Android to prevent clipping and improve rendering.
 * Android's font metrics differ from iOS, causing text to clip at edges.
 */
export const androidTextFix = (style: TextStyle = {}): TextStyle => {
  if (!isAndroid) return style;
  return {
    ...style,
    includeFontPadding: false,
    textAlignVertical: 'center' as const,
  };
};

/**
 * Android-safe font family mapping.
 * Falls back to system default on Android to avoid missing font crashes.
 */
export const androidFontFamily = (iosFont: string): string => {
  if (!isAndroid) return iosFont;
  if (iosFont === 'Arial' || iosFont === 'system-ui') return 'sans-serif';
  if (iosFont === 'ui-serif' || iosFont === 'Georgia') return 'serif';
  if (iosFont === 'ui-monospace' || iosFont === 'Menlo') return 'monospace';
  return 'sans-serif';
};

