import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { AppHeader } from "../src/components/layout/AppHeader";
import { BottomNav } from "../src/components/layout/BottomNav";
import { useAuth } from "../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../src/components/ui/Card";
import { Button } from "../src/components/ui/Button";

function getInitials(name?: string) {
  if (!name) return "F";
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // Generate a mock email if one isn't provided by the API
  const email = user?.fullName 
    ? `${user.fullName.split(" ")[0].toLowerCase()}@hindustanuniv.ac.in`
    : "faculty@hindustanuniv.ac.in";

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Profile"
        subtitle="Manage your faculty account"
        showMenu
      />
      
      <ScrollView className="flex-1 px-5 py-5 mb-20">
        <View className="items-center mt-4 mb-8">
          <View className="h-24 w-24 rounded-full bg-brand-blue items-center justify-center border-4 border-white shadow-sm mb-4">
            <Text className="text-3xl font-extrabold text-white">
              {getInitials(user?.fullName)}
            </Text>
          </View>
          <Text className="text-2xl font-extrabold text-navy text-center">
            {user?.fullName ?? "Faculty Name"}
          </Text>
        </View>

        <Card className="px-5 py-2 mb-6">
          <View className="flex-row items-center py-4 border-b border-surface-border">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light mr-4">
              <Ionicons name="id-card" size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-surface-muted mb-0.5">Faculty ID</Text>
              <Text className="text-[15px] font-semibold text-navy">
                {user?.facultyId ?? "ID Not Found"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-4 border-b border-surface-border">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light mr-4">
              <Ionicons name="business" size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-surface-muted mb-0.5">Department</Text>
              <Text className="text-[15px] font-semibold text-navy">
                {user?.department ?? "Not specified"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light mr-4">
              <Ionicons name="mail" size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-surface-muted mb-0.5">Email Address</Text>
              <Text className="text-[15px] font-semibold text-navy">
                {email}
              </Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity 
          onPress={logout}
          className="flex-row items-center justify-center bg-danger/10 py-4 rounded-xl border border-danger/20"
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-danger font-bold text-[15px] ml-2">
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
