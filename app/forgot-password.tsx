import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input } from "../src/components/ui/Input";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { HindustanLogo, HindustanBadge40 } from "../src/components/layout/HindustanBrandmark";
import { AppFooter } from "../src/components/layout/AppFooter";
import { Ionicons } from "@expo/vector-icons";
import { apiClient, ApiError } from "../src/services/apiClient";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2>(1);
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    if (!employeeId) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient.post("/api/auth/request-otp/", {
        employee_id: employeeId,
      });
      setSuccess(res.data.message || "OTP sent to your email.");
      setStep(2);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to request OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !newPassword) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient.post("/api/auth/verify-otp/", {
        employee_id: employeeId,
        otp,
        new_password: newPassword,
      });
      setSuccess("Password reset successfully. You can now log in.");
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to reset password. Please check your OTP.");
      }
    } finally {
      setIsLoading(false);
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
          {/* Custom Top Header */}
          <View
            style={{ paddingTop: insets.top + 20 }}
            className="bg-navy pb-10 rounded-b-[40px] items-center justify-center z-10 shadow-sm"
          >
            <View className="flex-row items-center justify-center gap-3">
              <HindustanLogo className="h-16 w-48" />
              <HindustanBadge40 className="h-14 w-14" />
            </View>
            <View className="items-center mt-6">
              <Image
                source={require("../assets/hsfas-logo-full.png")}
                style={{ width: 280, height: 280 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="flex-1 px-6 pb-6 pt-4 bg-surface">
            {/* Back Button */}
            <TouchableOpacity
              className="flex-row items-center mt-2 mb-4"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#1E3A8A" />
              <Text className="text-navy font-bold ml-1">Back to Login</Text>
            </TouchableOpacity>

            <View className="mb-6">
              <Text className="text-[26px] font-extrabold text-navy">
                Reset Password
              </Text>
              <Text className="text-sm text-surface-muted mt-1">
                {step === 1
                  ? "Enter your Faculty ID to receive a 6-digit OTP."
                  : "Enter the OTP sent to your email and your new password."}
              </Text>
            </View>

            <Card className="p-6">
              {error && (
                <View className="mb-4 rounded-xl bg-danger-light p-3">
                  <Text className="text-sm text-danger">{error}</Text>
                </View>
              )}
              {success && (
                <View className="mb-4 rounded-xl bg-success/10 p-3">
                  <Text className="text-sm text-success">{success}</Text>
                </View>
              )}

              {step === 1 ? (
                <View className="gap-5">
                  <Input
                    label="Faculty ID"
                    placeholder="Enter your Employee ID"
                    value={employeeId}
                    onChangeText={(text) => {
                      setEmployeeId(text);
                      setError(null);
                    }}
                    autoCapitalize="none"
                  />
                  <Button
                    className="mt-4"
                    onPress={handleRequestOtp}
                    isLoading={isLoading}
                    disabled={!employeeId}
                  >
                    Send OTP
                  </Button>
                </View>
              ) : (
                <View className="gap-5">
                  <Input
                    label="6-Digit OTP"
                    placeholder="Enter OTP"
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text);
                      setError(null);
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
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
                  <Button
                    className="mt-4"
                    onPress={handleVerifyOtp}
                    isLoading={isLoading}
                    disabled={otp.length !== 6 || !newPassword}
                  >
                    Reset Password
                  </Button>
                </View>
              )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppFooter />
    </View>
  );
}
