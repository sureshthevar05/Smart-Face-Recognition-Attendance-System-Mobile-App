import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabItem {
  name: string;
  path: string;
  icon: IconName;
  activeIcon: IconName;
}

const TABS: TabItem[] = [
  { name: "Home", path: "/timetable", icon: "home-outline", activeIcon: "home" },
  { name: "History", path: "/history", icon: "time-outline", activeIcon: "time" },
  { name: "Reports", path: "/reports", icon: "book-outline", activeIcon: "book" },
  { name: "Profile", path: "/profile", icon: "person-outline", activeIcon: "person" },
];

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      className="mt-auto flex-row items-center justify-around bg-navy px-2 pt-3"
    >
      {TABS.map((tab) => {
        // We do a simple exact match or prefix match for routes (like active tab)
        const isActive = pathname === tab.path;

        return (
          <TouchableOpacity
            key={tab.name}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) router.replace(tab.path as any);
            }}
            className="items-center justify-center relative w-16"
          >
            {/* Glowing top border indicator */}
            {isActive && (
              <View
                className="absolute -top-3 w-10 h-1 bg-brand-blue rounded-b-md"
                style={{
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.9,
                  shadowRadius: 8,
                  elevation: 10,
                }}
              />
            )}

            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)"}
            />
            <Text
              className={`text-[10px] mt-1 text-center ${
                isActive ? "text-white font-bold" : "text-white/50"
              }`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
