import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from "react-native";

type Variant = "primary" | "secondary" | "outline" | "danger";

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  textClassName?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-blue border-brand-blue", // React Native doesn't support complex gradients easily without expo-linear-gradient, simplified to solid
  secondary: "bg-navy border-navy",
  outline: "bg-white border border-brand-blue",
  danger: "bg-white border border-danger/40",
};

const textVariantClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-brand-blue",
  danger: "text-danger",
};

export const Button = ({
  variant = "primary",
  isLoading = false,
  fullWidth = true,
  className = "",
  textClassName = "",
  children,
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 ${
        fullWidth ? "w-full" : ""
      } ${variantClasses[variant]} ${(disabled || isLoading) ? "opacity-50" : ""} ${className}`}
      {...rest}
    >
      {isLoading && <ActivityIndicator color={variant === "outline" || variant === "danger" ? "#2563EB" : "#fff"} size="small" />}
      {typeof children === "string" ? (
        <Text className={`text-[15px] font-semibold ${textVariantClasses[variant]} ${textClassName}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
