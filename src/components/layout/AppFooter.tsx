import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AppFooter() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="mt-auto bg-navy px-5 pt-3.5 items-center justify-center">
      <Text className="text-[11px] text-white/60">
        HSFAS™ | All Rights Reserved
      </Text>
    </View>
  );
}
