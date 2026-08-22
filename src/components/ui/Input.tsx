import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = "", ...rest }: InputProps) => {
  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1 text-sm font-bold text-navy">{label}</Text>
      )}
      <View
        className={`flex-row items-center gap-2.5 rounded-2xl border bg-white px-4 h-12 transition-colors ${
          error ? "border-danger" : "border-surface-border"
        }`}
      >
        <TextInput
          className={`flex-1 min-w-0 bg-transparent text-[15px] text-navy ${className}`}
          placeholderTextColor="#6B7280"
          {...rest}
        />
      </View>
      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}
    </View>
  );
};
