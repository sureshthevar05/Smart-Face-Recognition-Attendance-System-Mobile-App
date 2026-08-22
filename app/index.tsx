import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function IndexScreen() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.replace("/timetable");
      } else {
        router.replace("/login");
      }
    }
  }, [isHydrated, isAuthenticated, router]);

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator size="large" color="#0B1E4D" />
    </View>
  );
}
