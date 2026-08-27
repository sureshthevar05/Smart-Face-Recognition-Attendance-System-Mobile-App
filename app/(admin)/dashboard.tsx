import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { useAuth } from '../../src/context/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { API_BASE_URL } from '../../src/services/apiClient';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecentSessions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/history/?all=true`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to load recent sessions', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentSessions();
  }, [fetchRecentSessions]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRecentSessions();
  };

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Admin Dashboard"
        subtitle={`Welcome, ${user?.fullName || 'Admin'}`}
      />
      
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
          <View className="flex-row items-center justify-between mb-4 mt-2">
            <Text className="text-sm font-bold text-navy uppercase tracking-wider">Recent Activity</Text>
            <View className="bg-brand-blue/10 px-2 py-1 rounded-md">
              <Text className="text-[10px] font-bold text-brand-blue uppercase">All Faculty</Text>
            </View>
          </View>

          {sessions.length === 0 ? (
            <Card className="items-center justify-center py-12">
              <Ionicons name="document-text-outline" size={48} color="#E2E8F0" />
              <Text className="text-surface-muted mt-4 font-medium">No recent attendance recorded.</Text>
            </Card>
          ) : (
            sessions.map((session, index) => (
              <TouchableOpacity 
                key={session.session_id || index} 
                onPress={() => router.push(`/history/${session.session_id}`)}
                activeOpacity={0.7}
              >
                <Card className="mb-3 p-4 border-l-4 border-l-brand-blue">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                        {session.course_code} - {session.course_name}
                      </Text>
                      <Text className="text-xs font-semibold text-brand-blue mt-1">
                        {session.target_department} • Year {session.target_year} • Sec {session.target_section}
                      </Text>
                      <Text className="text-[11px] text-surface-muted mt-0.5">
                        By {session.faculty_name}
                      </Text>
                    </View>
                    <View className="bg-[#F4F7FB] px-2 py-1 rounded-md items-end">
                      <Text className="text-[10px] font-semibold text-navy">
                        {session.date}
                      </Text>
                      <Text className="text-[10px] font-bold text-brand-blue mt-0.5">
                        Period {session.period_number}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center mt-3 pt-3 border-t border-surface-border">
                    <View className="flex-1 flex-row items-center">
                      <View className="h-2 w-2 rounded-full bg-success mr-2" />
                      <Text className="text-xs text-navy font-medium">{session.present} Present</Text>
                    </View>
                    <View className="flex-1 flex-row items-center">
                      <View className="h-2 w-2 rounded-full bg-danger mr-2" />
                      <Text className="text-xs text-navy font-medium">{session.absent} Absent</Text>
                    </View>
                    <View className="flex-1 flex-row items-center justify-end">
                      <Ionicons name="people" size={14} color="#64748B" className="mr-1" />
                      <Text className="text-xs text-surface-muted font-medium">{session.total_students} Total</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
