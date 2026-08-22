import React from "react";
import { Image, View, ViewProps } from "react-native";

export function HindustanLogo({ className, style, ...rest }: ViewProps & { className?: string }) {
  return (
    <Image
      source={require("../../../assets/assets/hindustan-logo.png")}
      resizeMode="contain"
      className={className || "h-11 w-11"}
      style={style}
    />
  );
}

export function HindustanBadge40({ className, style, ...rest }: ViewProps & { className?: string }) {
  return (
    <Image
      source={require("../../../assets/assets/hindustan-40-badge.png")}
      resizeMode="contain"
      className={className || "h-16 w-16"}
      style={style}
    />
  );
}
