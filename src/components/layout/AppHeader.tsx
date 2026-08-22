import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HindustanLogo, HindustanBadge40 } from "./HindustanBrandmark";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface AppHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  showMenu?: boolean;
}

export function AppHeader({ title, subtitle, onBack, showMenu }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ paddingTop: insets.top }} className="bg-navy px-5 pb-5 shadow-sm">
      <View className="flex-row items-center justify-between pt-4">
        {/* Left: Back */}
        <View className="flex-1 items-start">
          {onBack && (
            <TouchableOpacity onPress={onBack} className="h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Logos */}
        <View className="flex-row items-center justify-center gap-3">
          <HindustanLogo className="h-16 w-48" />
          <HindustanBadge40 className="h-16 w-16" />
        </View>

        {/* Right: Empty space to balance Left side */}
        <View className="flex-1 items-end" />
      </View>

      <View className="mt-5">
        <Text className="text-2xl font-extrabold text-white">{title}</Text>
        <Text className="mt-1 text-sm text-white/70">{subtitle}</Text>
      </View>
    </View>
  );
}
