import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader } from "../src/components/layout/AppHeader";
import { BottomNav } from "../src/components/layout/BottomNav";
import { Card } from "../src/components/ui/Card";
import { useAuth } from "../src/context/AuthContext";
import { useAttendanceFlow } from "../src/context/AttendanceFlowContext";
import { getTimetable } from "../src/services/timetableService";
import { ApiError } from "../src/services/apiClient";
import type { TimetableSlot, TimetableResponse } from "../src/types/timetable";
import { Ionicons } from "@expo/vector-icons";

function formatClassLabel(slot: TimetableSlot): string | null {
  const parts = [slot.target_department, slot.target_year, slot.target_section]
    .filter((p): p is string => !!p && p.trim().length > 0);
  if (parts.length === 0) return null;
  return parts.join(" ");
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function TimetableRow({ slot, onSelect }: { slot: TimetableSlot; onSelect: () => void }) {
  const isPending = slot.status === "Pending";
  const isCompleted = slot.status === "Completed";
  const classLabel = formatClassLabel(slot);

  const content = (
    <View
      className={`flex-row items-center gap-3 rounded-xl border-l-4 bg-white px-3.5 py-3 ${
        isCompleted || isPending ? "border-success" : "border-surface-border"
      }`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-lg ${
          isCompleted || isPending ? "bg-success" : "bg-surface-border"
        }`}
      >
        <Text className={`text-sm font-bold ${isCompleted || isPending ? "text-white" : "text-surface-muted"}`}>
          {slot.period}
        </Text>
      </View>
      <View className="flex-1 min-w-0">
        <Text className={`font-bold ${classLabel ? "text-navy" : "text-surface-muted"}`} numberOfLines={1}>
          {classLabel ?? "No Class"}
        </Text>
        <Text className="text-xs text-surface-muted">{slot.time}</Text>
      </View>
      <View
        className={`h-8 w-8 items-center justify-center rounded-full ${
          isCompleted ? "bg-success" : isPending ? "bg-success/15" : slot.status === "Locked" ? "bg-surface" : ""
        }`}
      >
        {isCompleted && <Ionicons name="checkmark" size={18} color="white" />}
        {isPending && <Ionicons name="chevron-forward" size={18} color="#16A34A" />}
        {slot.status === "Locked" && <Ionicons name="lock-closed" size={18} color="#9CA3AF" />}
      </View>
    </View>
  );

  if (!isPending) return content;
  return <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>{content}</TouchableOpacity>;
}

export default function TimetableScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setSelectedSlot } = useAttendanceFlow();
  const { scheduleClassNotifications } = require('../src/hooks/useNotifications').useTimetableNotifications();

  const [data, setData] = useState<TimetableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!user?.facultyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTimetable({ facultyId: user.facultyId });
      setData(res);
      if (res && res.timetable) {
        scheduleClassNotifications(res.timetable);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't load your timetable. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.facultyId]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  function handleSelectSlot(slot: TimetableSlot) {
    if (!data || slot.status !== "Pending" || !slot.timetable_slot_id) return;
    setSelectedSlot({
      timetableSlotId: slot.timetable_slot_id,
      date: data.date,
      courseCode: slot.course_code,
      courseName: slot.course_name,
      time: slot.time,
      department: slot.target_department,
      year: slot.target_year,
      section: slot.target_section,
    });
    router.push("/start-attendance");
  }

  const titleText = `${getGreeting()},\n${user?.fullName?.split(" ")[0] ?? "Faculty"} ${
    user?.gender === "M" ? "Sir" : user?.gender === "F" ? "Ma'am" : ""
  }!`;

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title={titleText}
        subtitle="Here's your class schedule for today."
        showMenu
      />

      <ScrollView className="flex-1 px-5 py-5">
        {isLoading && (
          <View className="py-10">
            <ActivityIndicator size="large" color="#0B1E4D" />
          </View>
        )}

        {error && (
          <View className="items-center py-10">
            <Text className="text-danger mb-4 text-center">{error}</Text>
            <TouchableOpacity onPress={fetchTimetable} className="bg-navy px-4 py-2 rounded-xl">
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {data && (
          <Card className="px-5 py-5 mb-10">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-blue">
                <Ionicons name="calendar" size={24} color="white" />
              </View>
              <View>
                <Text className="text-lg font-extrabold text-navy">{data.day_of_week}</Text>
                <Text className="text-sm text-surface-muted">{data.date}</Text>
              </View>
            </View>

            <View className="mt-4 gap-2.5">
              {data.timetable.map((slot) => (
                <TimetableRow
                  key={slot.period}
                  slot={slot}
                  onSelect={() => handleSelectSlot(slot)}
                />
              ))}
            </View>
          </Card>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
