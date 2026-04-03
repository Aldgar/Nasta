import React from "react";
import Svg, {
  Path,
  Text,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

interface NastaLogoProps {
  width?: number;
  height?: number;
  style?: any;
}

export default function NastaLogo({
  width = 400,
  height = 120,
  style,
}: NastaLogoProps) {
  const { isDark } = useTheme();
  const blueColor = isDark ? "#C9963F" : "#B8822A";
  const textColor = isDark ? "#F0E8D5" : "#1A1710";
  const borderColor = isDark ? "#E8B86D" : "#B8822A";

  return (
    <Svg width={width} height={height} viewBox="0 0 400 120" style={style}>
      <Defs>
        <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={blueColor} stopOpacity="1" />
          <Stop
            offset="100%"
            stopColor={isDark ? "#E8B86D" : "#A67A25"}
            stopOpacity="1"
          />
        </LinearGradient>
      </Defs>

      {/* Wavy cloud-like border with 3 distinct bumps on top and bottom */}
      <Path
        d="M 15 30 
           Q 25 15, 45 20
           Q 65 25, 90 22
           Q 115 19, 140 23
           Q 165 27, 190 22
           Q 215 17, 240 23
           Q 265 29, 290 22
           Q 315 15, 340 23
           Q 360 28, 385 30
           L 385 90
           Q 360 95, 340 93
           Q 315 91, 290 97
           Q 265 103, 240 97
           Q 215 91, 190 97
           Q 165 103, 140 97
           Q 115 91, 90 97
           Q 65 103, 45 98
           Q 25 93, 15 90
           Z"
        fill="none"
        stroke={borderColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text: Nasta */}
      <G transform="translate(200, 70)">
        <Text
          x="0"
          y="0"
          fontFamily="Arial, sans-serif"
          fontSize="48"
          fontWeight="700"
          fill={textColor}
          textAnchor="middle"
        >
          Nasta
        </Text>
      </G>
    </Svg>
  );
}
