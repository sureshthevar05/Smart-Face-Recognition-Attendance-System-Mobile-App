import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppFooter } from "../src/components/layout/AppFooter";
import { Card } from "../src/components/ui/Card";
import { Input } from "../src/components/ui/Input";
import { Button } from "../src/components/ui/Button";
import { changePassword } from "../src/services/authService";
import { useRouter } from "expo-router";
import { HindustanLogo, HindustanBadge40 } from "../src/components/layout/HindustanBrandmark";
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all the fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Your password has been changed successfully.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Top Header with Logos */}
          <View style={{ paddingTop: insets.top + 20 }} className="bg-navy pb-10 rounded-b-[40px] items-center justify-center z-10 shadow-sm relative">
            
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ position: 'absolute', top: insets.top + 20, left: 24, zIndex: 20 }}
              className="h-10 w-10 bg-white/10 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            {/* College Logos */}
            <View className="flex-row items-center justify-center gap-3 mt-4">
              <HindustanLogo className="h-16 w-48" />
              <HindustanBadge40 className="h-14 w-14" />
            </View>
          </View>

          <View className="flex-1 px-6 pb-6 pt-4 bg-surface mt-4">
            <View className="mb-6 mt-2">
              <Text className="text-[26px] font-extrabold text-navy">Reset Password</Text>
              <Text className="text-sm text-surface-muted mt-1 leading-5">
                Please enter your current password and your new password below.
              </Text>
            </View>

            <Card className="p-6">
              {error && (
                <View className="mb-4 rounded-xl bg-danger-light p-3">
                  <Text className="text-sm text-danger">{error}</Text>
                </View>
              )}

              <View className="gap-5">
                <Input
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    setError(null);
                  }}
                  secureTextEntry
                />

                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null);
                  }}
                  secureTextEntry
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  secureTextEntry
                />
              </View>

              <Button
                className="mt-8"
                onPress={handleSubmit}
                isLoading={loading}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
              
              <TouchableOpacity className="mt-6 items-center" onPress={() => router.push("/forgot-password")}>
                <Text className="text-surface-muted text-sm mb-1">Forgot your current password?</Text>
                <Text className="text-brand-blue font-bold text-[15px]">Reset via OTP</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppFooter />
    </View>
  );
}
