import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";

export const TouchableButton = React.forwardRef<any, TouchableOpacityProps>(
  (props, ref) => {
    return (
      <TouchableOpacity
        {...props}
        ref={ref}
        activeOpacity={0.7}
        style={[btnShadow.base, props.style]}
      />
    );
  },
);

TouchableButton.displayName = "TouchableButton";

const btnShadow = StyleSheet.create({
  base: {
    shadowColor: "#C9963F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 0,
  },
});
