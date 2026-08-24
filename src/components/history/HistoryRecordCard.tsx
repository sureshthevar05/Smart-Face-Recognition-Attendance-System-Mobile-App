import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { AttendanceHistoryRecord } from "../../types/history";

function StatusBadge({ status }: { status?: string }) {
  const isCompleted = (status || "").toLowerCase() === "completed";
  return (
    <View
      className={`shrink-0 rounded-full px-2.5 py-1 ${
        isCompleted ? "bg-success/10" : "bg-warning/10"
      }`}
    >
      <Text
        className={"text-xs font-semibold "}
      >
        {status}
      </Text>
    </View>
  );
}

export function HistoryRecordCard({ record }: { record: AttendanceHistoryRecord }) {
  const router = useRouter();
  return (
    <View className="rounded-2xl border border-surface-border bg-white px-4 py-4 mb-3">
      <View className="flex-row w-full items-start justify-between gap-3">
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-bold text-navy" numberOfLines={1}>
            {record.course_code} - {record.course_name}
          </Text>
          <Text className="mt-0.5 text-xs text-surface-muted">
            {record.class_group}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-surface-muted">{record.time}</Text>
          </View>
        </View>
        <View className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={record.status} />
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-surface-muted">{record.date}</Text>
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row justify-between border-t border-surface-border pt-3">
        <View className="items-center flex-1">
          <Text className="text-xs text-surface-muted">Total</Text>
          <Text className="text-sm font-bold text-navy">{record.total_students}</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs text-surface-muted">Present</Text>
          <Text className="text-sm font-bold text-success">{record.present}</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs text-surface-muted">Absent</Text>
          <Text className="text-sm font-bold text-danger">{record.absent}</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs text-surface-muted">Unknown</Text>
          <Text className="text-sm font-bold text-gold">{record.unknown}</Text>
        </View>
      </View>

      <View className="mt-2.5 flex-row w-full items-center justify-between pt-1">
        <TouchableOpacity
          onPress={() => router.push(`/history/${record.session_id}`)}
          className="flex-row items-center gap-1"
        >
          <Text className="text-xs font-semibold text-brand-blue">
            View details
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
