import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { useAuth } from '../../src/context/AuthContext';
import { Card } from '../../src/components/ui/Card';

export default function AdminProfile() {
  const { logout, user } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface">
      <AppHeader title="Admin Profile" subtitle="Manage your account" />
      
      <View className="p-6 pb-24 flex-1">
        <View className="items-center mb-8">
          <View className="h-24 w-24 rounded-full bg-brand-blue/10 items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#3B82F6" />
          </View>
          <Text className="text-xl font-bold text-navy">{user?.fullName || 'Admin User'}</Text>
          <Text className="text-brand-blue mt-1 uppercase text-xs font-bold tracking-wider">{user?.department || 'Administration'}</Text>
        </View>

        <Card className="p-0 overflow-hidden mb-6">
          <View className="p-4 flex-row items-center border-b border-surface-border">
            <Ionicons name="id-card-outline" size={20} color="#64748B" className="mr-3" />
            <View className="ml-3">
              <Text className="text-xs text-surface-muted uppercase">Employee ID</Text>
              <Text className="text-sm font-medium text-navy">{user?.facultyId || 'N/A'}</Text>
            </View>
          </View>
          <View className="p-4 flex-row items-center border-b border-surface-border">
            <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" className="mr-3" />
            <View className="ml-3">
              <Text className="text-xs text-surface-muted uppercase">Role</Text>
              <Text className="text-sm font-medium text-navy">System Administrator</Text>
            </View>
          </View>
        </Card>

        <View className="mt-auto">
          <TouchableOpacity 
            onPress={() => router.push("/change-password")}
            className="flex-row items-center justify-center p-4 bg-brand-blue/10 rounded-2xl border border-brand-blue/20 mb-3"
          >
            <Ionicons name="lock-closed-outline" size={20} color="#0A2463" />
            <Text className="ml-2 font-bold text-navy">Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={logout}
            className="flex-row items-center justify-center p-4 bg-red-50 rounded-2xl border border-red-100"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text className="ml-2 font-bold text-red-600">Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
