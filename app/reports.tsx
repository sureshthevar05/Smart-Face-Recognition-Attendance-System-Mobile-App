import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { AppHeader } from "../src/components/layout/AppHeader";
import { BottomNav } from "../src/components/layout/BottomNav";
import { Card } from "../src/components/ui/Card";
import { useAuth } from "../src/context/AuthContext";
import { getReports } from "../src/services/reportsService";
import type { ReportsResponse } from "../src/types/reports";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

const screenWidth = Dimensions.get("window").width;

function formatSeconds(seconds: number) {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const remainingM = m % 60;
  return `${h}h ${remainingM}m`;
}

export default function ReportsScreen() {
  const { user } = useAuth();
  const facultyId = user?.facultyId ?? "";

  const [data, setData] = useState<ReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classOpen, setClassOpen] = useState(false);
  const [classFilter, setClassFilter] = useState("All");

  const classOptions = useMemo(() => {
    if (!data) return [{ label: "All Classes", value: "All" }];
    const unique = Array.from(new Set(data.at_risk_students.map(s => s.class_group)));
    return [{ label: "All Classes", value: "All" }, ...unique.map(c => ({ label: c, value: c }))];
  }, [data]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    if (classFilter === "All") return data.at_risk_students;
    return data.at_risk_students.filter(s => s.class_group === classFilter);
  }, [data, classFilter]);

  const fetchReports = useCallback(async () => {
    if (!facultyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getReports(facultyId, 30);
      setData(res);
    } catch (err) {
      setError("Failed to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Reports"
        subtitle="Detailed insights from your attendance data"
        showMenu

      />
      
      <ScrollView className="flex-1 px-5 py-5" nestedScrollEnabled={true}>
        {isLoading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0B1E4D" />
          </View>
        )}

        {error && (
          <View className="items-center py-10">
            <Text className="text-danger mb-4">{error}</Text>
          </View>
        )}

        {data && (
          <View className="pb-10">
            {/* Key Insights Grid */}
            <Text className="text-lg font-extrabold text-navy mb-3">Key Insights</Text>
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%] bg-white rounded-xl p-4 border border-surface-border">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time-outline" size={16} color="#10B981" />
                  <Text className="text-[10px] font-bold text-surface-muted uppercase ml-1">Time Saved</Text>
                </View>
                <Text className="text-lg font-extrabold text-navy">
                  {formatSeconds(data.insights.time_saved.value_seconds)}
                </Text>
              </View>

              <View className="w-[48%] bg-white rounded-xl p-4 border border-surface-border">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="timer-outline" size={16} color="#F5A623" />
                  <Text className="text-[10px] font-bold text-surface-muted uppercase ml-1">Avg Processing</Text>
                </View>
                <Text className="text-lg font-extrabold text-navy">
                  {formatSeconds(data.insights.processing_time.value_seconds / (data.insights.total_sessions.value || 1))}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-6">
              <View className="w-[48%] bg-white rounded-xl p-4 border border-surface-border">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="people-outline" size={16} color="#9333EA" />
                  <Text className="text-[10px] font-bold text-surface-muted uppercase ml-1">Overall Attendance</Text>
                </View>
                <Text className="text-lg font-extrabold text-navy">
                  {data.insights.overall_attendance.value_percentage.toFixed(1)}%
                </Text>
              </View>

              <View className="w-[48%] bg-white rounded-xl p-4 border border-surface-border">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="book-outline" size={16} color="#2563EB" />
                  <Text className="text-[10px] font-bold text-surface-muted uppercase ml-1">Total Sessions</Text>
                </View>
                <Text className="text-lg font-extrabold text-navy">
                  {data.insights.total_sessions.value}
                </Text>
              </View>

            </View>

            {/* Chart */}
            {data.chart_data && data.chart_data.length > 0 && (
              <Card className="p-4 mb-6">
                <Text className="text-sm font-bold text-navy mb-3">Estimated Time: Manual vs Our App</Text>
                <LineChart
                  data={{
                    labels: data.chart_data.map(d => d.date.split("-")[2] || d.date),
                    datasets: [
                      {
                        data: data.chart_data.map(d => d.manual_time / 60),
                        color: (opacity = 1) => `rgba(37, 99, 235, 1)`, // brand-blue
                      },
                      {
                        data: data.chart_data.map(d => d.app_time / 60),
                        color: (opacity = 1) => `rgba(22, 163, 74, 1)`, // success
                      }
                    ]
                  }}
                  width={screenWidth - 72} // from padding
                  height={220}
                  yAxisSuffix="m"
                  yAxisLabel=""
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, 0.1)`, // Grid lines
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // text-surface-muted
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#fff"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
                <View className="flex-row justify-center mt-2 gap-4">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-brand-blue mr-1" />
                    <Text className="text-xs text-surface-muted">Manual (6s/student)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-success mr-1" />
                    <Text className="text-xs text-surface-muted">Our App</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* At Risk Students */}
            <View className="flex-row items-center justify-between mb-3 z-10">
              <Text className="text-lg font-extrabold text-navy">Students Below 75%</Text>
              <View className="w-40">
                <DropDownPicker
                  open={classOpen}
                  value={classFilter}
                  items={classOptions}
                  setOpen={setClassOpen}
                  setValue={setClassFilter}
                  style={{
                    backgroundColor: "#fff",
                    borderColor: "#e5e7eb",
                    minHeight: 36,
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#e5e7eb",
                  }}
                  textStyle={{ fontSize: 12, color: "#0B1E4D" }}
                  listMode="SCROLLVIEW"
                  placeholder="Class"
                />
              </View>
            </View>

            <View className="-z-10">
              <Card className="p-0 mb-4 overflow-hidden">
                <View className="flex-row border-b border-surface-border bg-surface/50 p-3">
                  <Text className="flex-1 text-xs font-bold text-surface-muted">Student</Text>
                  <Text className="w-16 text-xs font-bold text-surface-muted text-right">Att %</Text>
                </View>
                {filteredStudents.map((student, idx) => (
                  <View key={student.student_id} className={`flex-row p-3 items-center ${idx !== filteredStudents.length - 1 ? "border-b border-surface-border" : ""}`}>
                    <View className="flex-1 min-w-0">
                      <Text className="text-sm font-bold text-navy truncate" numberOfLines={1}>{student.name}</Text>
                      <Text className="text-xs text-surface-muted mt-0.5">{student.roll_number} • {student.class_group}</Text>
                    </View>
                    <Text className={`w-16 text-sm font-bold text-right ${student.attendance < 60 ? "text-danger" : "text-gold"}`}>
                      {student.attendance.toFixed(1)}%
                    </Text>
                  </View>
                ))}
                {filteredStudents.length === 0 && (
                  <View className="p-5 items-center">
                    <Text className="text-surface-muted">No students at risk!</Text>
                  </View>
                )}
              </Card>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
