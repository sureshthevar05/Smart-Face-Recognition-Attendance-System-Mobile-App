import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { Card } from '../../src/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { API_BASE_URL } from '../../src/services/apiClient';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface">
        <AppHeader title="Global Analytics" subtitle="College-wide statistics" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  // Fallback data structure if API response fails
  const stats = data || {
    overall_attendance: 0,
    total_sessions: 0,
    time_saved_seconds: 0,
    department_metrics: []
  };

  const chartData = {
    labels: stats.department_metrics.length > 0 
      ? stats.department_metrics.map((d: any) => d.department)
      : ['No Data'],
    datasets: [{
      data: stats.department_metrics.length > 0 
        ? stats.department_metrics.map((d: any) => d.attendance_pct)
        : [0]
    }]
  };

  const screenWidth = Dimensions.get('window').width - 48; // Padding adjustment

  const formatTimeSaved = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <View className="flex-1 bg-surface">
      <AppHeader title="Global Analytics" subtitle="College-wide statistics" />
      
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-sm font-bold text-navy uppercase tracking-wider mb-4">
          Quick Stats
        </Text>
        
        <View className="flex-row justify-between flex-wrap">
          <Card className="w-[48%] p-4 mb-4 items-center">
            <View className="h-10 w-10 rounded-full bg-success/10 items-center justify-center mb-2">
              <Ionicons name="pie-chart" size={20} color="#16A34A" />
            </View>
            <Text className="text-xl font-black text-navy">{stats.overall_attendance}%</Text>
            <Text className="text-[10px] text-surface-muted font-bold uppercase mt-1 text-center">Avg Attendance</Text>
          </Card>

          <Card className="w-[48%] p-4 mb-4 items-center">
            <View className="h-10 w-10 rounded-full bg-brand-blue/10 items-center justify-center mb-2">
              <Ionicons name="documents" size={20} color="#3B82F6" />
            </View>
            <Text className="text-xl font-black text-navy">{stats.total_sessions}</Text>
            <Text className="text-[10px] text-surface-muted font-bold uppercase mt-1 text-center">Total Classes</Text>
          </Card>

          <Card className="w-full p-4 mb-6 items-center flex-row">
            <View className="h-12 w-12 rounded-full bg-amber-500/10 items-center justify-center mr-4">
              <Ionicons name="time" size={24} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-2xl font-black text-navy">{formatTimeSaved(stats.time_saved_seconds)}</Text>
              <Text className="text-[10px] text-surface-muted font-bold uppercase mt-1">Manual Processing Time Saved</Text>
            </View>
          </Card>
        </View>

        <Text className="text-sm font-bold text-navy uppercase tracking-wider mb-4">
          Department Performance
        </Text>
        
        <Card className="p-4 items-center">
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
              style: { borderRadius: 16 },
              barPercentage: 0.7,
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
            fromZero={true}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
