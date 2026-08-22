import React from "react";
import { View, ViewProps } from "react-native";

export function Card({ className = "", ...rest }: ViewProps) {
  return (
    <View
      className={`rounded-2xl border border-surface-border bg-white shadow-sm ${className}`}
      style={{
        shadowColor: "#0B1E4D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2, // for Android
      }}
      {...rest}
    />
  );
}
