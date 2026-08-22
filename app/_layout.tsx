import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { AttendanceFlowProvider } from "../src/context/AttendanceFlowContext";
import "../global.css"; // Required for NativeWind

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AttendanceFlowProvider>
          <Stack
            screenOptions={{
              headerShown: false, // We're using our custom AppHeader
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="timetable" options={{ headerShown: false, animation: "none" }} />
            <Stack.Screen name="history" options={{ headerShown: false, animation: "none" }} />
            <Stack.Screen name="history/[session_id]" options={{ headerShown: false }} />
            <Stack.Screen name="reports" options={{ headerShown: false, animation: "none" }} />
            <Stack.Screen name="profile" options={{ headerShown: false, animation: "none" }} />
            <Stack.Screen name="start-attendance" options={{ headerShown: false }} />
            <Stack.Screen name="image-preview" options={{ headerShown: false }} />
            <Stack.Screen name="processing" options={{ headerShown: false }} />
            <Stack.Screen name="result" options={{ headerShown: false }} />
          </Stack>
        </AttendanceFlowProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
