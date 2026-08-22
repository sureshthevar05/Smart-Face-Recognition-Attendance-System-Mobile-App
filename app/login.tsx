import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppFooter } from "../src/components/layout/AppFooter";
import { Card } from "../src/components/ui/Card";
import { Input } from "../src/components/ui/Input";
import { Button } from "../src/components/ui/Button";
import { useAuth } from "../src/context/AuthContext";
import { HindustanLogo, HindustanBadge40 } from "../src/components/layout/HindustanBrandmark";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login, isLoggingIn, loginError, clearLoginError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    if (!username || !password) return;
    login({ username, password, rememberMe: true });
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
          <View style={{ paddingTop: insets.top + 20 }} className="bg-navy pb-10 rounded-b-[40px] items-center justify-center z-10 shadow-sm">
            {/* College Logos */}
            <View className="flex-row items-center justify-center gap-3">
              <HindustanLogo className="h-16 w-48" />
              <HindustanBadge40 className="h-14 w-14" />
            </View>
            
            {/* App Logo & Name */}
            <View className="items-center mt-6">
              <Image 
                source={require("../assets/hsfas-logo-full.png")} 
                style={{ width: 280, height: 280 }} 
                resizeMode="contain" 
              />
            </View>
          </View>

          <View className="flex-1 px-6 pb-6 pt-4 bg-surface">
            {/* Headings positioned similar to screenshot */}
            <View className="mb-6 mt-4">
              <Text className="text-[26px] font-extrabold text-navy">Faculty Login</Text>
              <Text className="text-sm text-surface-muted mt-1">
                Sign in to manage attendance
              </Text>
            </View>

            <Card className="p-6">
              {loginError && (
                <View className="mb-4 rounded-xl bg-danger-light p-3">
                  <Text className="text-sm text-danger">{loginError}</Text>
                </View>
              )}

              <View className="gap-5">
                <Input
                  label="Username / Faculty ID"
                  placeholder="Enter your ID"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (loginError) clearLoginError();
                  }}
                  autoCapitalize="none"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (loginError) clearLoginError();
                  }}
                  secureTextEntry
                />
              </View>
              
              {/* Remember me (matching screenshot logic) */}
              <View className="mt-5 flex-row items-center">
                <View className="h-5 w-5 rounded bg-brand-blue items-center justify-center mr-2.5">
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
                <Text className="text-navy text-sm font-semibold">Remember Me</Text>
              </View>

              <Button
                className="mt-8"
                onPress={handleLogin}
                isLoading={isLoggingIn}
                disabled={!username || !password}
              >
                Sign In
              </Button>
              
              <TouchableOpacity className="mt-6 items-center">
                <Text className="text-brand-blue font-bold text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </Card>

            {/* Credits Block */}
            <View className="mt-8 mb-4 p-5 rounded-2xl bg-[#F4F7FB] border border-surface-border shadow-sm">
              <View className="mb-5">
                <Text className="text-xs text-surface-muted mb-1 font-medium">Mentored by</Text>
                <Text className="text-[15px] font-bold text-navy">Dr. J. Thangakumar</Text>
                <Text className="text-[13px] text-surface-muted mt-0.5 font-medium">Associate Dean (CS)</Text>
              </View>

              <View>
                <Text className="text-xs text-surface-muted mb-2 font-medium">Developed by</Text>
                
                <View className="flex-row items-center mb-1.5 pl-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-navy mr-2.5" />
                  <Text className="text-[14px] font-bold text-navy">Vishwavel Sivakumar</Text>
                </View>
                
                <View className="flex-row items-center mb-1.5 pl-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-navy mr-2.5" />
                  <Text className="text-[14px] font-bold text-navy">V. Keerthana</Text>
                </View>

                <View className="flex-row items-center mb-1.5 pl-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-navy mr-2.5" />
                  <Text className="text-[14px] font-bold text-navy">Suresh Thevar</Text>
                </View>

                <View className="flex-row items-center pl-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-navy mr-2.5" />
                  <Text className="text-[14px] font-bold text-navy">Bharat Raj T</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppFooter />
    </View>
  );
}
